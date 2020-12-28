import React, {
    Component
  } from 'react';
  import './index.scss';
  import PokemonAPI from '../../services/api';
  export default class EvolutionInfo extends Component {
    constructor(props) {
      super(props)
      this.state = {
        pokemonInfo: []
      }
      this.selectedPokemon = ''
      this.evolutionData = []
      this.evolutionLevel = 1
    }
    
    componentDidMount() {
      this.parseEvolutionChain(this.props.evolutionData)
    }

    calculatePokemonChain = async (chainData) => {
      // Could just only iterate up to 3 levels
      if (!chainData.length) return
      this.evolutionLevel++
      var tempList = []
      // Explore multiple elements at the same level
      chainData.forEach(async (item, index) => {
        let {species} = item
        let pokemonId = species.url.split("pokemon-species")[1].replace(/\//g, '')
        pokemonId = Number(pokemonId)
        let findData = this.props.pokemonList.find(item => item.id === pokemonId)
        tempList.push({missingInfoPokeId: !findData ? pokemonId : 0, ...findData})
        if (index === chainData.length - 1) {
          this.evolutionData.push({pokemonData: [...tempList], level: this.evolutionLevel,  missingInfoPokeId: !findData ? pokemonId : 0})
          // Recursive function to do deep array iteration
          return this.calculatePokemonChain(item.evolves_to)
        }
      })
    }
  
    parseEvolutionChain = async (data) => {
      if (!data) return
      const {name, id} = data
      this.selectedPokemon = name
      let speciesData = await PokemonAPI.getPokemonSpeciesById(id)
      if (!speciesData || !speciesData.evolution_chain || !speciesData.evolution_chain.url) return
      let evolutionChainData = await PokemonAPI.getPokemonEvolutionChainByUrl(speciesData.evolution_chain.url)
      const {chain} = evolutionChainData
      let pokemonId = chain.species.url.split("pokemon-species")[1].replace(/\//g, '')
      pokemonId = Number(pokemonId)
      //wobbuffet exception, use loop to find pokemon data through api call that are not in the list.
      let findData = this.props.pokemonList.find(item => item.id === pokemonId)
      this.evolutionData.push({pokemonData: [{missingInfoPokeId: !findData ? pokemonId : 0, ...findData}], missingInfoPokeId: !findData ? pokemonId : 0, level: this.evolutionLevel})

      this.calculatePokemonChain(chain.evolves_to)
      console.log(this.evolutionData)
      for (let i = 0; i < this.evolutionData.length; i++) {
        if (this.evolutionData[i].missingInfoPokeId === 0) continue
        await new Promise((resolve) => {
          let item = this.evolutionData[i]
          item.pokemonData.forEach(async (item1, index1, arr1) => {
            if (item1.missingInfoPokeId === 0) return
            let fData = await PokemonAPI.getPokemonInfoById(item1.missingInfoPokeId)
            fData.main_img = fData.sprites.other['official-artwork'].front_default || fData.sprites.other.dream_world.front_default
            arr1[index1] = {...item1, ...fData}
            resolve()
          })
        })
      }
      setTimeout(() => {
        this.setState({
          pokemonInfo: this.evolutionData
        })
      }, 1000)
    }

    render() {
      const {pokemonInfo} = this.state
      return (
        <div className="pokemon-chain-list">
          <div className="back-to-list">
            <div className="back" onClick={this.props.hideEvolutionInfo}>
              <i>&#8592;</i>
              <h2 className="text">Back</h2>
            </div>
            { this.selectedPokemon && <h2 className="selected">Evolution chain for <b>{this.selectedPokemon}</b></h2>}
            <span>&nbsp;</span>
          </div>
          <div className="chain-list">
            {
              pokemonInfo.map((item, index) => (
                <div className="single-pokemon-container" key={`pokemon-level-${item.level}-${index}`}>
                  {
                    item.pokemonData.map((item1, index1) => ((
                      <div className="single-pokemon" key={`pokemon-${item.name}-${index1}`}>
                        <img src={item1.main_img} alt={item1.name} />
                        <p className="name">{item1.name}</p>
                      </div>
                    )))
                  }
                </div>
              ))
            }
          </div>
        </div>
      )
    }
  }