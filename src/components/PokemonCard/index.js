import React, {
    Component
  } from 'react';
  import './index.scss';
  export default class PokemonCard extends Component {
    constructor(props) {
      super(props)
      this.state = {}
    }

    static getDerivedStateFromProps(newProps) {
      return {...newProps.pokeData}
    }
    
    render() {
      const {name, stats, main_img} = this.state
      const {onCardClick} = this.props
      const displayStats = stats.slice(0,3).map((item, index) => (
        <div className="stat-item" key={index}>
          <p className="heading">{ item.name }</p>
          <p className="value">{ item.value }</p>
        </div>
      ))
      return (
        <div className="pokemon-card">
          <div className="image-container" onClick={onCardClick}>
            <img src={main_img} lazy="true" alt="Pokemon" />
          </div>
          <div className="description-container">
            <h2 className="name" onClick={onCardClick}>
              {name}
            </h2>
            <div className="stats">
              {displayStats}
            </div>
          </div>
        </div>
      )
    }
  }