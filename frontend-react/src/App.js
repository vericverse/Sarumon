import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Dex from './components/Dex'
import Header from './components/Header'
import { SERVER_URL } from './components/constants'
import { fillMissingData } from './utils'
import { sampleData } from './sampleData'

function App() {
  const [isDark, setTheme] = useState(true)
  const [data, setData] = useState([])
  const [fetchedData, setFetchedData] = useState([])
  const [count, setCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [showOwned, setShowOwned] = useState(false)
  const [filters, setFilters] = useState({ ability: '', type: '' });

  // !Fetch from server once
  useEffect(() => {
    fetch(SERVER_URL)
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        return Promise.reject(res)
      })
      .then(data => {
        setTotalCount(data.length + 1)
        data.sort((a, b) => a.number - b.number)
        fillMissingData(data)

        setData(data)
        setFetchedData(data)
      })
      .catch((error) => {
        console.log('Something went wrong.', error)
      })
  }, [])

  // useEffect(() => {
  //   let data = sampleData
  //   setTotalCount(data.length)
  //   data.sort((a, b) => a.number - b.number)
  //   fillMissingData(data)

  //   setData(data)
  //   setFetchedData(data)
  // }, []);

  useEffect(() => {
    let data = fetchedData
    if (search !== '') {
      data = data.filter(mon => {
        if ((/^\d*$/).test(search)) {
          return +search === +mon.number
        } else if (mon.nfts !== undefined) {
          const name = mon.nfts[0].metadata.name
          if (!name) return null
          let regEx = new RegExp(search, 'ig')
          return regEx.test(name)
        }
      })
      // setCount(data.length)
      // setData(data)
    }
    if (showOwned) {
      data = data.filter(mon => mon.owned)
      // setCount(data.length)
      // setData(data)
    }
    if (filters.ability !== '' || filters.type !== '') {
      data = data.filter(mon => {
        if (mon.nfts) {
          let attrs = mon.nfts[0].metadata.attributes
          return attrs[2].value === filters.type || attrs[3].value === filters.type || attrs[11].value === filters.ability || attrs[12].value === filters.ability
        }
      })
      // setCount(data.length)
      // setData(data)
    }
    else {
      setCount(fetchedData.length + 1)
      setData(fetchedData)
    }
    setCount(data.length)
    setData(data)
  }, [search, fetchedData, showOwned, filters.ability, filters.type])

  return (
    <div className={`App ${isDark ? 'dark' : 'light'}`}>
      <Navbar isDark={isDark} setTheme={setTheme} />
      {fetchedData.length ? (
        <div className="container">
          <Header props={{
            isDark, count, showOwned, setShowOwned, totalCount, search, setSearch, filters, setFilters
          }} />
          <Dex isDark={isDark} data={data} totalCount={totalCount} count={count} />
        </div>
      ) : (
        <div className='center-loading'>Starting...</div>
      )}
    </div>
  )
}

export default App
