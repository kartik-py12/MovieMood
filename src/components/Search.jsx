const Search = ({searchTerm,setSearchTerm}) => {
  return (
    <div className='search'>
        <div>
            <img src="search.svg" alt="search" />
            <input 
                type="text"
                placeholder='Search through thousands of movies'
                // Ensures input is always in sync with state (controlled component)
                // Uncontrolled input: Works fine but won't reflect external state updates or reset automatically
                // we are making value a control componenet
                 value={searchTerm}
                onChange={(e)=>setSearchTerm(e.target.value)} />
        </div>
    </div>
  )
}

export default Search