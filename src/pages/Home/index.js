import React, {
  Component,
  Suspense, 
  lazy
} from 'react';
import './index.scss';
import Logo from '../../assets/images/logo.png';
import Loader from '../../assets/images/loader.svg';
import PokemonAPI from '../../services/api';
const PokemonCard = lazy(() => import("../../components/PokemonCard"));

export default class Home extends Component {
  constructor() {
    super()
    this.state = {
      pokemonList: [],
      pokemonInfo: [],
      showList: true,
      showLoader: true
    }
    this.totalPokemonCount = 0
    this.evolutionData = []
    this.evolutionLevel = 1
    this.selectedPokemon = ''
    this.apiOffset = 0
    this.apiLimit = 50
    this.observer = null
    this.loaderRef = null
    this.observerOptions = {
      root: null,
      rootMargin: "50px",
      threshold: .1,
    }
  }

  componentDidMount() {
    this.fetchPokemonList()
    this.bindInfiniteScroll()
  }

  bindInfiniteScroll = () => {
    this.observer = new IntersectionObserver(
      this.observerCallBack,
      this.observerOptions
    )
    this.observer.observe(this.loaderRef)
  }

  observerCallBack = (elements) => {
    const {isIntersecting} = elements[0]
    const {pokemonList, showList} = this.state
    if (!showList || !isIntersecting || !pokemonList.length || this.apiOffset >= this.totalPokemonCount) return
    this.setState({
      showLoader: true
    })
    this.fetchPokemonList()
  }

  fetchPokemonList = async () => {
    let pokemonData = await PokemonAPI.getPokemonList(this.apiOffset, this.apiLimit)
    this.totalPokemonCount = pokemonData.count
    if (!pokemonData || !pokemonData.results || !pokemonData.results.length) return

    pokemonData = pokemonData.results
    let data = await Promise.all(pokemonData.map((item) => PokemonAPI.getPokemonInfoByUrl(item.url)))
    data = data.map((item) => {
      let {stats, sprites} = item
      stats = stats.map((stat) => ({name: stat.stat.name, value: stat.base_stat}))
      let main_img = sprites.other['official-artwork'].front_default || sprites.other['dream_world'].front_default
      return {...item, main_img, stats: stats}
    })
    this.apiOffset = this.apiOffset + this.apiLimit
    this.setState((state) => ({
      pokemonList: [...state.pokemonList, ...data],
      showLoader: false
    }))
  }

  calculatePokemonChain = async (chainData) => {
    // Could just only iterate up to 3 levels
    if (!chainData.length) return
    this.evolutionLevel++
    var tempList = []
    chainData.forEach(async (item, index) => {
      let {species} = item
      let pokemonId = species.url.split("pokemon-species")[1].replace(/\//g, '')
      pokemonId = Number(pokemonId)
      let findData = this.state.pokemonList.find(item => item.id === pokemonId)
      tempList.push({missingInfoPokeId: !findData ? pokemonId : 0, ...findData})
      if (index === chainData.length - 1) {
        this.evolutionData.push({pokemonData: [...tempList], level: this.evolutionLevel,  missingInfoPokeId: !findData ? pokemonId : 0})
        return this.calculatePokemonChain(item.evolves_to)
      }
    })
  }

  capitalizeWord = (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1)
  }

  onPokemonCardClick = async (e, data) => {
    this.setState({
      showList: false
    })
    let speciesData = await PokemonAPI.getPokemonSpeciesByUrl(data.species.url)
    let evolutionChainData = await PokemonAPI.getPokemonEvolutionChainByUrl(speciesData.evolution_chain.url)
    this.selectedPokemon = `Evolution Chain for ${this.capitalizeWord(data.name)}`
    const {chain} = evolutionChainData
    let pokemonId = chain.species.url.split("pokemon-species")[1].replace(/\//g, '')
    pokemonId = Number(pokemonId)
    // wobbuffet exception, use loop to find pokemon data through api call that are not in the list.
    let findData = this.state.pokemonList.find(item => item.id === pokemonId)
    this.evolutionData.push({pokemonData: [{missingInfoPokeId: !findData ? pokemonId : 0, ...findData}], missingInfoPokeId: !findData ? pokemonId : 0, level: this.evolutionLevel})
    this.calculatePokemonChain(chain.evolves_to)
    console.log(evolutionChainData)
    for (let i = 0; i < this.evolutionData.length; i++) {
      if (!this.evolutionData[i].missingInfoPokeId) continue
      await new Promise((resolve) => {
        let item = this.evolutionData[i]
        item.pokemonData.forEach(async (item1, index1, arr1) => {
          if (!item1.missingInfoPokeId) {
            return
          }
          let fData = await PokemonAPI.getPokemonInfoById(item1.missingInfoPokeId)
          fData.main_img = fData.sprites.other['official-artwork'].front_default || fData.sprites.other.dream_world.front_default
          console.log(fData)
          arr1[index1] = fData
          resolve()
        })
      })
    }

    this.setState({
      showLoader: false,
      pokemonInfo: this.evolutionData
    })
  }

  showListFunc = () => {
    this.evolutionData = []
    this.evolutionLevel = 1
    this.setState({
      showList: true
    })
  }

  render() {
    const {pokemonList, pokemonInfo, showList, showLoader} = this.state

    const pokemonCards = pokemonList.map((item, index) => (
      <Suspense key={item.id} fallback={<div></div>}>
        <PokemonCard pokeData={item} onCardClick={(e) => this.onPokemonCardClick(e, item)} />
      </Suspense>
    ))
    
    const levelHeading = (
      <div className="level-list">
        {
          pokemonInfo.map((item, index) => (
            <p className="level-text" key={`level-${index}`}>{ `Level ${index + 1}` }</p>
          ))
        }
      </div>
    )
    const evolutionChain = (
      <div className="chain-list">
        {
          pokemonInfo.map((item, index) => (
            <div className="single-pokemon-container" key={`pokemon-level-${item.level}-${index}`}>
              {
                item.pokemonData.map((item1) => ((
                  <div className="single-pokemon" key={item1.name}>
                    <img src={item1.main_img} alt={item1.name} />
                    <p className="name">{item1.name}</p>
                  </div>
                )))
              }
            </div>
          ))
        }
      </div>
    )
    return (
      <div className="home-page">
        <div className="banner">
          <img src={Logo} lazy="true" alt="Banner Img"/>
        </div>

        { showList && <div className="pokemon-list-container">
            <h1> Choose a Pokemon to see its Evolution Chain </h1>
            <div className="pokemon-list">
              {pokemonCards}
            </div>
          </div>
        }

        { !showList && <div className="pokemon-chain-list">
            <div className="back-to-list">
              <div className="back" onClick={this.showListFunc}>
                <i>&#8592;</i>
                <h2 className="text">Back</h2>
              </div>
              <h2 className="selected">{this.selectedPokemon}</h2>
              <span>&nbsp;</span>
            </div>
            {levelHeading}
            {evolutionChain}
          </div>
        }

        <div className="loader" ref={e => this.loaderRef = e}>
          { showLoader && <img src={Loader} alt="Loader" /> }
        </div>
      </div>
    )
  }
}