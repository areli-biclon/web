import { useEffect, useRef, useState } from 'react'
import { MorphIcon } from 'morphicons/react'
// lucide 导出的是图标数据(不是组件),可直接传给 MorphIcon
import {
  Menu, X, Sun, Moon, Heart, Star, Play, Settings,
  Bell, Search, Home, User, Mail, Lock, Eye, EyeOff,
  ChevronDown, ChevronUp, Volume2, VolumeX,
} from 'lucide'

const ICONS = {
  Menu, X, Sun, Moon, Heart, Star, Play, Settings,
  Bell, Search, Home, User, Mail, Lock, Eye, EyeOff,
  ChevronDown, ChevronUp, Volume2, VolumeX,
}

const PRESETS = ['smooth', 'snappy', 'bouncy']

const label = (icon) =>
  Object.keys(ICONS).find((k) => ICONS[k] === icon) ?? '?'

function App() {
  const [icon, setIcon] = useState(Sun)
  const [spring, setSpring] = useState('snappy')
  const [stroke, setStroke] = useState(1.5)
  const [auto, setAuto] = useState(true)
  const iconRef = useRef(icon)

  const pick = (next) => {
    setAuto(false)
    iconRef.current = next
    setIcon(next)
  }

  // 自动循环:每 2.6s 随机跳到另一个图标,演示 morph 动效
  useEffect(() => {
    const keys = Object.keys(ICONS)
    const id = setInterval(() => {
      if (!auto) return
      let next = keys[Math.floor(Math.random() * keys.length)]
      while (ICONS[next] === iconRef.current) next = keys[Math.floor(Math.random() * keys.length)]
      iconRef.current = ICONS[next]
      setIcon(ICONS[next])
    }, 2600)
    return () => clearInterval(id)
  }, [auto])

  return (
    <div className="app">
      <h1>Morphicons 演示</h1>
      <p className="sub">任意两个图标之间平滑形变,spring 弹簧物理,零依赖</p>

      {/* 主舞台 */}
      <div className="stage">
        <MorphIcon icon={icon} spring={spring} strokeWidth={stroke} size={96} />
        <div className="stage-label">{label(icon)}</div>
      </div>

      {/* 控件 */}
      <div className="controls">
        <fieldset>
          <legend>弹簧手感</legend>
          <div className="seg">
            {PRESETS.map((p) => (
              <button key={p} className={spring === p ? 'active' : ''} onClick={() => setSpring(p)}>
                {p}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>描边宽度</legend>
          <div className="seg">
            {[1, 1.5, 2, 2.5, 3].map((w) => (
              <button key={w} className={stroke === w ? 'active' : ''} onClick={() => setStroke(w)}>
                {w}
              </button>
            ))}
          </div>
        </fieldset>

        <button className={auto ? 'auto-on' : ''} onClick={() => setAuto(!auto)}>
          自动演示: {auto ? '开' : '关'}
        </button>
      </div>

      {/* 图标选择:点击即 morph 到该图标 */}
      <h2>点击任意图标,morph 到它</h2>
      <div className="grid">
        {Object.entries(ICONS).map(([name, data]) => (
          <button
            key={name}
            className={'icon-btn' + (data === icon ? ' current' : '')}
            onClick={() => pick(data)}
          >
            <MorphIcon icon={data} size={28} strokeWidth={1.5} />
            <span>{name}</span>
          </button>
        ))}
      </div>

      <div className="hint">上方舞台会从当前图标平滑形变到点击的图标。</div>
    </div>
  )
}

export default App