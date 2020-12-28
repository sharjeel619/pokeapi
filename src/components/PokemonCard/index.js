import React, {
    Component
  } from 'react';
  import './index.scss';
  export default class PokemonCard extends Component {
    constructor(props) {
      super(props)
      this.state = {}
      this.pokemonTypeData = {
        fire: '#FDDFDF',
        grass: '#DEFDE0',
        electric: '#FCF7DE',
        water: '#DEF3FD',
        ground: '#f4e7da',
        rock: '#d5d5d4',
        fairy: '#fceaff',
        poison: '#98d7a5',
        bug: '#f8d5a3',
        dragon: '#97b3e6',
        psychic: '#eaeda1',
        flying: '#F5F5F5',
        fighting: '#E6E0D4',
        normal: '#F5F5F5',
        ghost: '#a7afdb',
        ice: '#92e0f7',
        steel: '#5695A3',
        dark: '#828282'
      }
    }

    static getDerivedStateFromProps(newProps) {
      return {...newProps.pokeData}
    }
    
    render() {
      const {name, stats, main_img, types} = this.state
      const {onCardClick} = this.props
      const displayStats = stats.slice(0,3).map((item, index) => (
        <div className="stat-item" key={index}>
          <p className="heading">{ item.name }</p>
          <p className="value">{ item.value }</p>
        </div>
      ))
      return (
        <div className="pokemon-card">
          <div className="image-container" style={{background: this.pokemonTypeData[types[0]]}} onClick={onCardClick}>
            <img src={main_img} lazy="true" alt="Pokemon" />
          </div>
          <div className="description-container">
            <div className="pokemon-title">
              <h2 className="name" onClick={onCardClick}>{name}</h2>
              {
                types.map((item) => (
                  <div className={`type-icon ${item}`} title={item} key={item}>
                    <img src={`./images/${item}.svg`} alt={item}/>
                  </div>
                ))
              }
            </div>
            <div className="stats">
              {displayStats}
            </div>
          </div>
        </div>
      )
    }
  }