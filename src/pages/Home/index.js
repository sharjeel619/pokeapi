import React, {
  Component,
  Suspense, 
  lazy
} from 'react';
import './index.scss';
import PokemonAPI from '../../services/api';
const PokemonCard = lazy(() => import("../../components/PokemonCard"));
const EvolutionInfo = lazy(() => import("../../components/EvolutionInfo"));
export default class Home extends Component {
  constructor() {
    super()
    this.state = {
      pokemonList: [],
      pokemonInfo: [],
      showList: true,
      showLoader: true,
      selectedPokemon: null
    }
    this.evolutionData = []
    this.evolutionLevel = 1
    this.totalPokemonCount = 0
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
    const {pokemonList, showList, showLoader} = this.state
    if (!showList || showLoader || !isIntersecting || !pokemonList.length || this.apiOffset >= this.totalPokemonCount) return
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
      let {stats, sprites, types} = item
      stats = stats.map((stat) => ({name: stat.stat.name, value: stat.base_stat}))
      let main_img = sprites.other['official-artwork'].front_default || sprites.other['dream_world'].front_default
      let pokeTypes = types.map((item) => item.type.name)
      return {...item, main_img, stats: stats, types: pokeTypes}
    })
    this.apiOffset = this.apiOffset + this.apiLimit
    this.setState((state) => ({
      pokemonList: [...state.pokemonList, ...data],
      showLoader: false
    }))
  }

  hideEvolutionInfo = () => {
    this.setState({
      showList: true,
      showLoader: false
    })
  }

  onPokemonCardClick = async (e, data) => {
    this.setState({
      selectedPokemon: data,
      showLoader: true,
      showList: false
    })
  }

  loaderVisibility = (val) => {
    this.setState({
      showLoader: val
    })
  }

  render() {
    const {pokemonList, showList, showLoader, selectedPokemon} = this.state
    return (
      <div className="home-page">
        <div className="banner">
          <img src="./images/logo1.png" lazy="true" alt="Banner Img"/>
        </div>
        <div className="pokemon-list-container" style={{display: showList ? 'block' : 'none'}}>
          <h2 className="title"> Choose a Pokemon to see its Evolution Chain </h2>
          <div className="pokemon-list">
            { 
              pokemonList.map((item, index) => (
                <Suspense key={item.id} fallback={<div></div>}>
                  <PokemonCard pokeData={item} onCardClick={(e) => this.onPokemonCardClick(e, item)} />
                </Suspense>
              ))
            }
          </div>
        </div>
        <div>
          { !showList && <Suspense fallback={<div></div>}>
              <EvolutionInfo pokemonList={pokemonList} evolutionData={selectedPokemon} hideEvolutionInfo={this.hideEvolutionInfo} loaderVisibility={this.loaderVisibility} />
            </Suspense>
          }
        </div>
        <div className="loader" ref={e => this.loaderRef = e}>
          <img src="./images/loader.svg" alt="Loader" style={{display: showLoader ? 'block' : 'none'}} />
        </div>
      </div>
    )
  }
}