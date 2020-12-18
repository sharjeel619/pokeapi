const base_url = 'https://pokeapi.co/api/v2/';
let PoekmonAPI = {
  getPokemonList(_offset, _limit) {
    const defaultOffsetCount = 0
    const defaultLimitCount = 20
    return new Promise((resolve, reject) => {
      fetch(`${base_url}pokemon?offset=${_offset || defaultOffsetCount}&limit=${_limit || defaultLimitCount}`)
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  },

  getPokemonInfoByUrl(_url) {
    return new Promise((resolve, reject) => {
      fetch(_url)
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  },

  getPokemonInfoById(_id) {
    return new Promise((resolve, reject) => {
      fetch(`${base_url}pokemon/${_id}`)
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  },

  getPokemonEvolutionChainById(_id) {
    return new Promise((resolve, reject) => {
      fetch(`${base_url}evolution-chain/${_id}`)
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  },

  getPokemonEvolutionChainByUrl(_url) {
    return new Promise((resolve, reject) => {
      fetch(_url)
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  },

  getPokemonSpeciesByUrl(_url) {
    return new Promise((resolve, reject) => {
      fetch(_url)
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  },

  getPokemonSpeciesById(_id) {
    return new Promise((resolve, reject) => {
      fetch(`${base_url}pokemon-species/${_id}`)
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  },
}
export default PoekmonAPI;