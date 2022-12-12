import { useState } from 'react'
import {
  Unstable_Grid2 as Grid2,
  Stack,
  TextField,
  Button,
  IconButton,
  List,
  ListSubheader,
  ListItemButton,
  ListItemText,
  Tooltip,
  Alert,
  Chip,
  Avatar,
  Link,
} from '@mui/material'
import { RadarRounded as RadarRoundedIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { blue, red } from '@mui/material/colors'

/**
 * 模拟操作定义
 * @param {string} key 操作的键
 * @param {string} name 功能名称
 * @param {string} func 操作函数
 */
type Execution = [key: string, name: string, func: Function]
/**
 * 模拟操作数据
 * @param {string} key - 操作的键
 * @param {string} x - 横坐标
 * @param {string} y - 纵坐标
 * @param {string} ms - 下个动作等待时间
 */
type Action = [key: string, x: number, y: number, ms: number]

const keymap: Array<Execution> = [
  ['p', '左键双击', window.utools?.simulateMouseDoubleClick],
  ['[', '左键单击', window.utools?.simulateMouseClick],
  [']', '右键单击', window.utools?.simulateMouseRightClick],
]

// 操作函数map
const mapping: Record<string, Function> = keymap.reduce((acc, [key, name, fn]) => ({ ...acc, [key]: fn }), {})
// 延迟函数
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 执行 / 停止
let block
async function exec(actions: Array<Action>, times = 1, callback?: Function) {
  block = false
  for (let time = 0; time < times; time++) {
    for (let step = 0; step < actions.length; step++) {
      const [key, x, y, ms] = actions[step]
      if (block) return
      mapping[key]?.(x, y)
      ms && (await sleep(ms))
      callback && callback(time, step)
    }
  }
}
export default function App() {
  const [actions, setActions] = useState<Array<Action>>([])
  const [times, setTimes] = useState(1)
  const [delay, setDelay] = useState(1000)

  // 按下快捷键注册
  document.onkeydown = e => {
    if (keymap.map(([k]) => k).includes(e.key)) {
      const { x, y } = window.utools?.getCursorScreenPoint?.() || { x: 0, y: 0 }
      setActions([...actions, [e.key, x, y, delay]])
    }
  }
  // 页面从后台切换到活跃时, 停止执行
  document.onvisibilitychange = () => {
    if (document.visibilityState === 'visible') {
      block = true
    }
  }

  return (
    <Grid2 container spacing={2}>
      <Grid2 xs={8}>
        <List subheader={<ListSubheader>操作列表</ListSubheader>} style={{ height: 'calc(100vh - 2.375rem)', overflowY: 'scroll' }}>
          {actions.map(([key, x, y, ms], index) => (
            <ListItemButton key={index}>
              <ListItemText primary={`${keymap.find(item => item[0] === key)?.[1]} (x:${x} y:${y})`} />
              <TextField
                label='延迟(毫秒)'
                type='number'
                variant='standard'
                value={ms}
                inputProps={{ min: 0 }}
                onChange={e => Number(e.target.value) >= 0 && setActions(actions.map((item, i) => (i === index ? [key, x, y, Number(e.target.value)] : item)))}
              />
              <Tooltip title='定位'>
                <IconButton onClick={() => window.utools.simulateMouseMove(x, y)}>
                  <RadarRoundedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='删除'>
                <IconButton onClick={() => setActions(actions.filter((_, i) => i !== index))}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </ListItemButton>
          ))}
        </List>
      </Grid2>

      <Grid2 xs={4}>
        <Stack spacing={2}>
          <Button variant='contained' fullWidth onClick={() => exec(actions, times)}>
            执行
          </Button>
          <TextField
            label='执行次数'
            type='number'
            variant='standard'
            fullWidth
            value={times}
            inputProps={{ min: 1 }}
            onChange={e => Number(e.target.value) > 0 && setTimes(Number(e.target.value))}
          />
          <TextField
            label='默认等待时间'
            type='number'
            variant='standard'
            fullWidth
            value={delay}
            inputProps={{ min: 0 }}
            onChange={e => Number(e.target.value) > 0 && setDelay(Number(e.target.value))}
          />

          <Alert color='info' icon={false}>
            保持当前窗口为
            <Link href='#' underline='hover' onClick={() => window.utools?.shellOpenExternal('https://baike.baidu.com/item/活动窗口')}>
              活动窗口
            </Link>
            ，按下快捷键模拟点击，即可添加到操作列表
            <br />
            重新进入此插件应用即可停止回放
            <Stack spacing={1}>
              {keymap.map(([k, n]) => (
                <Chip key={k} avatar={<Avatar style={{ backgroundColor: blue[700], color: 'white' }}>{k}</Avatar>} label={n} />
              ))}
            </Stack>
          </Alert>

          <Alert color='warning' icon={false}>
            插件应用处于非活动窗口时，无法监听到任何操作，因此无法在插件应用外使用快捷键暂停，使用前请确保未隐藏界面，或为此插件应用注册
            <Link href='#' underline='hover' color={red[500]} onClick={() => window.utools?.redirect('偏好设置', '')}>
              全局快捷键
            </Link>
            以快速打开应用停止回放
          </Alert>
        </Stack>
      </Grid2>
    </Grid2>
  )
}
