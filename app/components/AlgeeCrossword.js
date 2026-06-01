'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

/*
  ── Verified grid layout ────────────────────────────────────────────────────
  1-Across  DETROIT   row=0,  col=0   D(0,0)E(0,1)T(0,2)R(0,3)O(0,4)I(0,5)T(0,6)
  2-Down    TRESVANT  row=0,  col=2   T(0,2)R(1,2)E(2,2)S(3,2)V(4,2)A(5,2)N(6,2)T(7,2)
  3-Down    MCKAY     row=3,  col=0   M(3,0)C(4,0)K(5,0)A(6,0)Y(7,0)
  4-Down    EUPHORIA  row=4,  col=6   E(4,6)U(5,6)P(6,6)H(7,6)O(8,6)R(9,6)I(10,6)A(11,6)
  5-Across  KHALIL    row=5,  col=0   K(5,0)H(5,1)A(5,2)L(5,3)I(5,4)L(5,5)
  6-Across  LOVELOST  row=8,  col=1   L(8,1)O(8,2)V(8,3)E(8,4)L(8,5)O(8,6)S(8,7)T(8,8)
  7-Across  SAGINAW   row=10, col=3   S(10,3)A(10,4)G(10,5)I(10,6)N(10,7)A(10,8)W(10,9)

  Intersections (shared cells - must match both words):
  (0,2)  T  = DETROIT[2]   = TRESVANT[0]  ✓
  (5,0)  K  = MCKAY[2]     = KHALIL[0]    ✓
  (5,2)  A  = TRESVANT[5]  = KHALIL[2]    ✓
  (8,6)  O  = EUPHORIA[4]  = LOVELOST[5]  ✓
  (10,6) I  = EUPHORIA[6]  = SAGINAW[3]   ✓
  ────────────────────────────────────────────────────────────────────────────
*/

const WORDS = [
  {
    num: 1, dir: 'across', row: 0,  col: 0,
    answer: 'DETROIT',
    clue:   "Kathryn Bigelow's gripping 2017 film starring Algee",
  },
  {
    num: 2, dir: 'down',   row: 0,  col: 2,
    answer: 'TRESVANT',
    clue:   'Ralph _____, the New Edition legend Algee portrayed on BET',
  },
  {
    num: 3, dir: 'down',   row: 3,  col: 0,
    answer: 'MCKAY',
    clue:   "Algee's last name as a college student in Euphoria",
  },
  {
    num: 4, dir: 'down',   row: 4,  col: 6,
    answer: 'EUPHORIA',
    clue:   'HBO show where a generation claimed Algee as their own',
  },
  {
    num: 5, dir: 'across', row: 5,  col: 0,
    answer: 'KHALIL',
    clue:   "Algee's character in The Hate U Give - brief on screen, permanent in memory",
  },
  {
    num: 6, dir: 'across', row: 8,  col: 1,
    answer: 'LOVELOST',
    clue:   "Algee's 2025 debut album - direct to fans, no filter (two words, no space)",
  },
  {
    num: 7, dir: 'across', row: 10, col: 3,
    answer: 'SAGINAW',
    clue:   'The Michigan city where it all began for Algee',
  },
]

/* ── Build a flat map of every cell ── */
function buildCells() {
  const map = {} // key: "row,col"

  WORDS.forEach(w => {
    for (let i = 0; i < w.answer.length; i++) {
      const r = w.dir === 'across' ? w.row : w.row + i
      const c = w.dir === 'across' ? w.col + i : w.col
      const key = `${r},${c}`
      if (!map[key]) map[key] = { row: r, col: c, letter: w.answer[i], number: null, words: [] }
      map[key].words.push({ num: w.num, dir: w.dir, idx: i })
      if (i === 0) map[key].number = w.num
    }
  })
  return map
}

const CELL_MAP = buildCells()

/* ── Which cells belong to a word ── */
function cellsForWord(word) {
  const cells = []
  for (let i = 0; i < word.answer.length; i++) {
    const r = word.dir === 'across' ? word.row : word.row + i
    const c = word.dir === 'across' ? word.col + i : word.col
    cells.push(`${r},${c}`)
  }
  return cells
}

/* Grid bounds */
const ROWS = 12
const COLS = 10

export default function AlgeeCrossword({ onSolve }) {
  const [filled,   setFilled]   = useState({})    // key → typed letter
  const [correct,  setCorrect]  = useState({})    // key → boolean
  const [selected, setSelected] = useState(null)  // "row,col"
  const [dir,      setDir]      = useState('across')
  const [activeWord, setActiveWord] = useState(null) // word num
  const [solved,   setSolved]   = useState(false)
  const inputRefs = useRef({})

  /* Determine which word is "active" for a given cell + direction */
  const wordForCell = useCallback((key, direction) => {
    const cell = CELL_MAP[key]
    if (!cell) return null
    const match = cell.words.find(w => w.dir === direction)
    if (match) return WORDS.find(w => w.num === match.num && w.dir === direction)
    // fallback to other direction
    const other = cell.words.find(w => w.dir !== direction)
    if (other) return WORDS.find(w => w.num === other.num && w.dir === other.dir)
    return null
  }, [])

  const selectCell = useCallback((key, forceDir) => {
    if (!CELL_MAP[key]) return
    let newDir = forceDir ?? dir
    // if current dir has no word here, flip
    const cell = CELL_MAP[key]
    const hasCurrent = cell.words.some(w => w.dir === newDir)
    if (!hasCurrent) newDir = newDir === 'across' ? 'down' : 'across'

    setSelected(key)
    setDir(newDir)
    const word = wordForCell(key, newDir)
    setActiveWord(word?.num ?? null)
    setTimeout(() => inputRefs.current[key]?.focus(), 0)
  }, [dir, wordForCell])

  const handleCellClick = useCallback((key) => {
    if (selected === key) {
      // toggle direction on second click
      const newDir = dir === 'across' ? 'down' : 'across'
      const cell = CELL_MAP[key]
      if (cell.words.some(w => w.dir === newDir)) {
        setDir(newDir)
        const word = wordForCell(key, newDir)
        setActiveWord(word?.num ?? null)
      }
    } else {
      selectCell(key)
    }
  }, [selected, dir, selectCell, wordForCell])

  const advance = useCallback((key, direction) => {
    const [r, c] = key.split(',').map(Number)
    const next = direction === 'across' ? `${r},${c + 1}` : `${r + 1},${c}`
    if (!CELL_MAP[next]) return
    // Only advance if the next cell is part of the same active word —
    // prevents bleeding into adjacent cells that belong to different words
    const inSameWord = CELL_MAP[next].words.some(w => w.num === activeWord && w.dir === direction)
    if (inSameWord) selectCell(next, direction)
  }, [selectCell, activeWord])

  const retreat = useCallback((key, direction) => {
    const [r, c] = key.split(',').map(Number)
    const prev = direction === 'across' ? `${r},${c - 1}` : `${r - 1},${c}`
    if (CELL_MAP[prev]) selectCell(prev, direction)
  }, [selectCell])

  const handleKeyDown = useCallback((e, key) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (filled[key]) {
        setFilled(prev => { const n = { ...prev }; delete n[key]; return n })
        setCorrect(prev => { const n = { ...prev }; delete n[key]; return n })
      } else {
        retreat(key, dir)
      }
      return
    }
    if (e.key === 'ArrowRight') { e.preventDefault(); selectCell(`${key.split(',')[0]},${+key.split(',')[1] + 1}`, 'across'); return }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); selectCell(`${key.split(',')[0]},${+key.split(',')[1] - 1}`, 'across'); return }
    if (e.key === 'ArrowDown')  { e.preventDefault(); selectCell(`${+key.split(',')[0] + 1},${key.split(',')[1]}`, 'down'); return }
    if (e.key === 'ArrowUp')    { e.preventDefault(); selectCell(`${+key.split(',')[0] - 1},${key.split(',')[1]}`, 'down'); return }
    if (e.key === 'Tab') {
      e.preventDefault()
      const idx = WORDS.findIndex(w => w.num === activeWord && w.dir === dir)
      const next = WORDS[(idx + 1) % WORDS.length]
      if (next) {
        const firstKey = `${next.row},${next.col}`
        selectCell(firstKey, next.dir)
      }
    }
  }, [filled, dir, retreat, selectCell, activeWord])

  const handleInput = useCallback((e, key) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/, '')
    if (!val) return
    const letter = val.slice(-1)
    const expected = CELL_MAP[key]?.letter
    const isCorrect = letter === expected

    setFilled(prev => ({ ...prev, [key]: letter }))
    setCorrect(prev => ({ ...prev, [key]: isCorrect }))

    // clear native input to keep it as a controlled overlay
    e.target.value = ''

    advance(key, dir)

    // check if fully solved
    const allKeys = Object.keys(CELL_MAP)
    const allFilled = allKeys.every(k => (k === key ? isCorrect : correct[k] === true && filled[k]))
    if (allFilled && isCorrect) {
      // re-check properly
      const newCorrect = { ...correct, [key]: isCorrect }
      const newFilled  = { ...filled,  [key]: letter }
      const fullyDone  = allKeys.every(k => newCorrect[k] === true && newFilled[k])
      if (fullyDone) {
        setSolved(true)
        onSolve?.()
      }
    }
  }, [dir, advance, correct, filled, onSolve])

  // re-check on every state change
  useEffect(() => {
    const allKeys = Object.keys(CELL_MAP)
    if (allKeys.length === 0) return
    const done = allKeys.every(k => correct[k] === true && filled[k])
    if (done && !solved) {
      setSolved(true)
      onSolve?.()
    }
  }, [correct, filled, solved, onSolve])

  /* Active word cells for highlight */
  const activeWordObj = WORDS.find(w => w.num === activeWord && w.dir === dir)
  const highlightedCells = new Set(activeWordObj ? cellsForWord(activeWordObj) : [])

  /* Clue panels */
  const acrossWords = WORDS.filter(w => w.dir === 'across')
  const downWords   = WORDS.filter(w => w.dir === 'down')

  return (
    <div className="cw-root">
      {/* Grid */}
      <div className="cw-grid-wrap">
        <div
          className="cw-grid"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const key  = `${r},${c}`
              const cell = CELL_MAP[key]
              if (!cell) return <div key={key} className="cw-empty" />

              const isSelected   = selected === key
              const isHighlighted = highlightedCells.has(key)
              const isFilled     = !!filled[key]
              const isCorrectCell = correct[key] === true
              const isWrong      = isFilled && !isCorrectCell

              return (
                <div
                  key={key}
                  className={[
                    'cw-cell',
                    isSelected    ? 'cw-cell-selected' : '',
                    isHighlighted ? 'cw-cell-highlighted' : '',
                    isCorrectCell ? 'cw-cell-correct' : '',
                    isWrong       ? 'cw-cell-wrong' : '',
                  ].join(' ')}
                  onClick={() => handleCellClick(key)}
                >
                  {cell.number && (
                    <span className="cw-num">{cell.number}</span>
                  )}
                  <span className="cw-letter">
                    {filled[key] || ''}
                  </span>
                  <input
                    ref={el => { if (el) inputRefs.current[key] = el }}
                    className="cw-input"
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="characters"
                    maxLength={2}
                    onKeyDown={e => handleKeyDown(e, key)}
                    onInput={e => handleInput(e, key)}
                    onFocus={() => selectCell(key)}
                    aria-label={`Row ${r + 1}, column ${c + 1}`}
                  />
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Clues */}
      <div className="cw-clues">
        <div className="cw-clue-section">
          <div className="cw-clue-heading">ACROSS</div>
          {acrossWords.map(w => (
            <div
              key={`${w.num}-across`}
              className={`cw-clue${activeWord === w.num && dir === 'across' ? ' cw-clue-active' : ''}${cellsForWord(w).every(k => correct[k]) ? ' cw-clue-done' : ''}`}
              onClick={() => selectCell(`${w.row},${w.col}`, 'across')}
            >
              <span className="cw-clue-num">{w.num}</span>
              <span>{w.clue}</span>
            </div>
          ))}
        </div>
        <div className="cw-clue-section">
          <div className="cw-clue-heading">DOWN</div>
          {downWords.map(w => (
            <div
              key={`${w.num}-down`}
              className={`cw-clue${activeWord === w.num && dir === 'down' ? ' cw-clue-active' : ''}${cellsForWord(w).every(k => correct[k]) ? ' cw-clue-done' : ''}`}
              onClick={() => selectCell(`${w.row},${w.col}`, 'down')}
            >
              <span className="cw-clue-num">{w.num}</span>
              <span>{w.clue}</span>
            </div>
          ))}
        </div>
      </div>

      {solved && (
        <div className="cw-solved">
          🎉 Puzzle complete! +50 pts added to your account.
        </div>
      )}
    </div>
  )
}
