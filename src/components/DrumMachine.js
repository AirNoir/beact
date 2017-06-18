import React, { Component } from 'react';
import styles from '../styles/DrumMachine.css';
import Matrix from './Matrix';
/**
 * DrumMachine
 */
class DrumMachine extends Component {
  /**
   * [constructor description]
   */
  constructor() {
    super();
    this.state = {
      data: [
        [1, 0, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ],
    };

    // this.handleClick = this.handleClick.bind(this);
  }

  /**
   * [handleClick description]
   * @param  {number} i first index
   * @param  {number} j second index
   */
  handleClick(i, j) {
    const data = this.state.data;
    data[i][j] = (data[i][j] === 0) ? 1 : 0;
    this.setState({
      data,
    });
  }

  /**
   * [render description]
   * @return {Element}
   */
  render() {
    return (
      <div>
        <h1 className={styles.title}>
          Drum Machine
        </h1>
        <Matrix
          data={this.state.data}
          onClick={(i, j) => this.handleClick(i, j)}
        />
      </div>
    );
  }

}

export default DrumMachine;
