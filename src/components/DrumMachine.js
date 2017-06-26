import React, { Component } from 'react';
import { WindowResizeListener } from 'react-window-resize-listener';
import _ from 'lodash';
import uuid4 from 'uuid/v4';
import axios from 'axios';
import key from 'keymaster';
import NavigationMenuIcon from 'material-ui/svg-icons/navigation/menu';
import NavigationRefreshIcon from 'material-ui/svg-icons/navigation/refresh';
import NavigationCloseIcon from 'material-ui/svg-icons/navigation/close';
import AVShuffleIcon from 'material-ui/svg-icons/av/shuffle';

import styles from '../assets/styles/DrumMachine.css';
import Matrix from './Matrix';
import { Sequencer, Keyboard } from '../utils/Audio';
import Animation from '../utils/Animation';

let fadeoutID;
/**
 * DrumMachine
 */
class DrumMachine extends Component {
  /**
   * [constructor description]
   */
  constructor() {
    super();
    const data = [];
    for (let i = 0; i < 16; i += 1) {
      data[i] = [];
      for (let j = 0; j < 8; j += 1) {
        data[i][j] = (Math.random() > 0.15) ? 0 : 1;
      }
    }

    this.state = {
      data,
      currentBeat: 0,
      playing: false,
      patternLists: [],
      patternTitle: '',
      currentPatternId: '',
      drumNoteChain: [],
      currentChainElement: '',
      currentPlayingChainElement: 0,
      records: [],
      currentPlayingRecord: [],
      currentPlayingRecordElement: 0,

			hidden: true,
			wait: true,
			idle: false,
    };

    this.setCurrentBeat = this.setCurrentBeat.bind(this);
    this.recordSequencer = this.recordSequencer.bind(this);
    this.saveRecord = this.saveRecord.bind(this);
    this.clearRecord = this.clearRecord.bind(this);

    this.storeRecord = this.storeRecord.bind(this);
    this.playRecord = this.playRecord.bind(this);
    this.playNextRecordElement = this.playNextRecordElement.bind(this);
    this.exitPlayRecord = this.exitPlayRecord.bind(this);

    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.savePattern = this.savePattern.bind(this);
    this.playPattern = this.playPattern.bind(this);
    this.editPattern = this.editPattern.bind(this);
    this.deleteCurrentPattern = this.deleteCurrentPattern.bind(this);
    this.exitPattern = this.exitPattern.bind(this);
    this.renderPatterns = this.renderPatterns.bind(this);
    this.updateChain = this.updateChain.bind(this);
    this.renderChain = this.renderChain.bind(this);
    this.setCurrentChainElementAtLast = this.setCurrentChainElementAtLast.bind(this);
    this.setCurrentChainElementAtHere = this.setCurrentChainElementAtHere.bind(this);
    this.deleteCurrentChainElement = this.deleteCurrentChainElement.bind(this);

    this.playNextChainElement = this.playNextChainElement.bind(this);
    this.playChain = this.playChain.bind(this);
    this.exitChain = this.exitChain.bind(this);

    this.playDrumAni = this.playDrumAni.bind(this);

    this.detectKeyboard = this.detectKeyboard.bind(this);

    this.sequencer = new Sequencer(
      this.state.data,
      this.setCurrentBeat,
      this.playNextChainElement,
      this.storeRecord,
      this.playNextRecordElement,
      this.playDrumAni,
    );

    this.keyboard = new Keyboard();

    this.toggleHidden = this.toggleHidden.bind(this);
		this.hideSpinner = this.hideSpinner.bind(this);
		this.showDOM = this.showDOM.bind(this);
  }

  /**
   * [componentDidMount description]
   */
  componentDidMount() {
    this.detectKeyboard();
    // this.ani = new Animation();
    this.ani = Animation();
    axios.get('/api/patterns')
      .then((res) => {
        this.setState({ patternLists: res.data });
      })
      .catch((err) => {
        console.log(err);
      });
    axios.get('/api/notes')
      .then((res) => {
        this.setState({ records: res.data });
      })
      .catch((err) => {
        console.log(err);
      });
		/**
	   * hide loading spinner and wait 3.5s after DOM is loaded.
	   */
	  const outShowDOM = this.hideSpinner;
		/**
	   * [startTimer description]
	   */
		function startTimer() {
			fadeoutID = window.setTimeout(outShowDOM, 3500);
		}
		startTimer();
  }

  /**
   * [setCurrentBeat description]
   * @param {number} currentBeat
   */
  setCurrentBeat(currentBeat) {
    if (currentBeat === 0) {
      // this.ani.trigger(13);
    }
    this.setState({
      currentBeat,
    });
  }

  /**
   * [setCurrentChainAtLast description]
   */
  setCurrentChainElementAtLast() {
    this.sequencer.isPlayingChain = false;
    this.sequencer.isPlayingRecord = false;
    this.setState({ currentChainElement: '' });
  }

  /**
  * @param  {String} id width of window
   * [setCurrentChainAtHere description]
   */
  setCurrentChainElementAtHere(id) {
    this.sequencer.isPlayingChain = false;
    this.sequencer.isPlayingRecord = false;
    const drumNoteChain = this.state.drumNoteChain;
    const data = this.state.data;
    for (let k = 0; k < drumNoteChain.length; k += 1) {
      if (drumNoteChain[k].id === id) {
        for (let i = 0; i < 16; i += 1) {
          for (let j = 0; j < 8; j += 1) {
            data[i][j] = drumNoteChain[k].data[i][j];
          }
        }
      }
    }
    this.setState({ currentChainElement: id, data });
  }
	/**
   * [showDOM description]
   */
	showDOM() {
		const rootDiv = document.getElementById('root');
		rootDiv.classList.add('fullHeight');
		this.setState({ wait: false });
	}
	/**
   * [hideSpinner description]
   */
	hideSpinner() {
		const spinner = document.getElementById('spinner');
		spinner.classList.add('loaded');
 		const loadingTitle = document.getElementById('loadingTitle');
 		loadingTitle.classList.add('loaded');
 		window.clearTimeout(fadeoutID);
		fadeoutID = window.setTimeout(this.showDOM, 1500);
 	}

	/**
   * [clearClicked description]
   * @param  {number} i first index
   * @param  {number} j second index
   */
	clearClicked() {
		const data = this.state.data;
		let i;
		let j;
		for (i = 0; i < 16; i += 1) {
			for (j = 0; j < 8; j += 1) {
				data[i][j] = 0;
			}
		}
		this.setState({
			data,
		});
	}
  /**
   * [clearClicked description]
   * @param  {number} i first index
   * @param  {number} j second index
   */
	randomClicked() {
		const data = this.state.data;
		let i;
		let j;
		for (i = 0; i < 16; i += 1) {
			for (j = 0; j < 8; j += 1) {
				data[i][j] = (Math.random() > 0.8) ? 1 : 0;
			}
		}
		this.setState({
			data,
		});
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
   * [handleResize description]
   * @param  {number} w width of window
   * @param  {number} h height of window
   */
  handleResize(w, h) {
    this.ani.resize(w, h);
  }

  /**
   * [startSequence description]
   */
  startSequencer() {
    this.ani.trigger(21);
    this.sequencer.start();
    this.setState({
      playing: true,
    });
  }

  /**
   * [stopSequencer description]
   */
  stopSequencer() {
    this.sequencer.stop();
    this.setState({
      playing: false,
      currentBeat: 0,
    });
  }

  /**
   * [recordSequencer description]
   */
  recordSequencer() {
    if (this.sequencer.recording === true) {
      this.sequencer.stopRecording();
    } else {
      this.sequencer.startRecording();
    }
  }

  /**
   * [saveRecord description]
   */
  saveRecord() {
    // add title as a paramater (feature)
    this.sequencer.saveRecord();
  }

  /**
   * [clearRecord description]
   */
  clearRecord() {
    this.sequencer.clearRecord();
  }

  /**
  * @param  {Array} records width of window
   * [storeRecord description]
   */
  storeRecord(records) {
    this.setState({ records });
  }

  /**
  * @param  {Array} record width of window
   * [playRecord description]
   */
  playRecord(record) {
    console.log(record);
    this.sequencer.isPlayingChain = false;
    this.sequencer.isPlayingRecord = true;
    this.stopSequencer();
    this.exitPattern();
    const data = this.state.data;
    for (let i = 0; i < 16; i += 1) {
      for (let j = 0; j < 8; j += 1) {
        data[i][j] = record[0][i][j];
      }
    }
    this.setState({ data, currentPlayingRecord: record, currentPlayingRecordElement: 0 });
    this.startSequencer();
  }

  /**
   * [exitPlayRecord description]
   */
  exitPlayRecord() {
    if (this.sequencer.isPlayingRecord === true) {
      this.sequencer.isPlayingRecord = false;
      const data = this.state.data;
      for (let i = 0; i < 16; i += 1) {
        for (let j = 0; j < 8; j += 1) {
          data[i][j] = 0;
        }
      }
      this.setState({ data, currentPlayingRecord: [], currentPlayingRecordElement: 0 });
      this.stopSequencer();
    }
  }
  /**
   * [playNextRecordElement description]
   */
  playNextRecordElement() {
    let num = this.state.currentPlayingRecordElement;
    num += 1;
    // we can configure it to no replay mode
    if (num === this.state.currentPlayingRecord.length) {
      num = 0;
    }
    const data = this.state.data;
    for (let i = 0; i < 16; i += 1) {
      for (let j = 0; j < 8; j += 1) {
        data[i][j] = this.state.currentPlayingRecord[num][i][j];
      }
    }
    this.setState({ currentPlayingRecordElement: num, data });
  }

  /**
  * @param  {object} event width of window
   * [playPattern description]
   */
  handleTitleChange(event) {
    this.setState({ patternTitle: event.target.value });
  }

  /**
   * [savePattern description]
   */
  savePattern() {
    if (this.state.patternTitle !== '') {
      axios.post('/api/patterns', {
        title: this.state.patternTitle,
        content: this.state.data,
      })
      .catch(err => console.log(err));
      this.setState({ patternTitle: '' });
      axios.get('/api/patterns')
        .then((res) => {
          this.setState({ patternLists: res.data });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log('Please give your pattern a name!');
    }
  }

  /**
  * @param  {object} pattern width of window
   * [playPattern description]
   */
  playPattern(pattern) {
    this.sequencer.isPlayingRecord = false;
    this.sequencer.isPlayingChain = false;
    this.stopSequencer();
    const data = this.state.data;
    for (let i = 0; i < 16; i += 1) {
      for (let j = 0; j < 8; j += 1) {
        data[i][j] = pattern.content[i][j];
      }
    }
    this.setState({
      data,
      currentPatternId: pattern._id, // eslint-disable-line no-underscore-dangle
    });
    this.startSequencer();
  }

  /**
   * [editPattern description]
   */
  editPattern() {
    if (this.state.patternTitle !== '') {
      axios.put(`/api/patterns/${this.state.currentPatternId}`, {
        title: this.state.patternTitle,
        content: this.state.data,
      })
      .catch(err => console.log(err));
    } else {
      axios.put(`/api/patterns/${this.state.currentPatternId}`, {
        content: this.state.data,
      })
      .catch(err => console.log(err));
    }
    axios.get('/api/patterns')
      .then((res) => {
        this.setState({ patternLists: res.data });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  /**
   * [exitPattern description]
   */
  exitPattern() {
    if (this.state.currentPatternId !== '') {
      const data = this.state.data;
      for (let i = 0; i < 16; i += 1) {
        for (let j = 0; j < 8; j += 1) {
          data[i][j] = 0;
        }
      }
      this.setState({ currentPatternId: '', data });
      this.stopSequencer();
    }
  }

  /**
   * [deleteCurrentPattern description]
   */
  deleteCurrentPattern() {
    if (this.state.currentPatternId !== '') {
      axios.delete(`/api/patterns/${this.state.currentPatternId}`)
       .catch((err) => {
         console.log(err);
       });
       axios.get('/api/patterns')
         .then((res) => {
           this.setState({ patternLists: res.data });
         })
         .catch((err) => {
           console.log(err);
         });
      this.exitPattern();
      this.stopSequencer();
    }
  }

  /**
   * [appendChain description]
   */
  updateChain() {
    const drumNoteChain = this.state.drumNoteChain;
    const data = [[0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]];
    for (let i = 0; i < 16; i += 1) {
      for (let j = 0; j < 8; j += 1) {
        data[i][j] = this.state.data[i][j];
      }
    }
    const newChainElement = { id: uuid4(), data };
    if (this.state.currentChainElement === '') {
      drumNoteChain.push(newChainElement);
    } else {
      for (let i = 0; i < drumNoteChain.length; i += 1) {
        if (drumNoteChain[i].id === this.state.currentChainElement) {
          newChainElement.id = drumNoteChain[i].id;
          drumNoteChain[i] = newChainElement;
        }
      }
    }
    this.setState({ drumNoteChain });
  }

  /**
   * [deleteCurrentChainElement description]
   */
  deleteCurrentChainElement() {
    if (this.state.currentChainElement !== '') {
      const drumNoteChain = this.state.drumNoteChain;
      const newDrumNoteChain = drumNoteChain.filter(
        element => element.id !== this.state.currentChainElement);
      drumNoteChain.pop();
      for (let k = 0; k < drumNoteChain.length; k += 1) {
        drumNoteChain[k].id = newDrumNoteChain[k].id;
        for (let i = 0; i < 16; i += 1) {
          for (let j = 0; j < 8; j += 1) {
            drumNoteChain[k].data[i][j] = newDrumNoteChain[k].data[i][j];
          }
        }
      }
      this.setState({ drumNoteChain, currentChainElement: '' });
      this.stopSequencer();
      this.exitPattern();
    }
  }

  /**
   * [playChain description]
   */
  playChain() {
    this.sequencer.isPlayingRecord = false;
    this.sequencer.isPlayingChain = true;
    this.stopSequencer();
    this.exitPattern();
    const data = this.state.data;
    for (let i = 0; i < 16; i += 1) {
      for (let j = 0; j < 8; j += 1) {
        data[i][j] = this.state.drumNoteChain[0].data[i][j];
      }
    }
    this.setState({ data });
    this.startSequencer();
  }

  /**
   * [clearChain description]
   */
  exitChain() {
    if (this.sequencer.isPlayingChain === true) {
      this.sequencer.isPlayingChain = false;
      const data = this.state.data;
      for (let i = 0; i < 16; i += 1) {
        for (let j = 0; j < 8; j += 1) {
          data[i][j] = 0;
        }
      }
      this.stopSequencer();
      this.setState({ currentPlayingChainElement: 0, data, currentChainElement: '' });
    }
  }

  /**
   * [playNextChainElement description]
   */
  playNextChainElement() {
    let num = this.state.currentPlayingChainElement;
    num += 1;
    // we can configure it to no replay mode
    if (num === this.state.drumNoteChain.length) {
      num = 0;
    }
    const data = this.state.data;
    for (let i = 0; i < 16; i += 1) {
      for (let j = 0; j < 8; j += 1) {
        data[i][j] = this.state.drumNoteChain[num].data[i][j];
      }
    }
    this.setState({ currentPlayingChainElement: num, data });
  }

  /**
   * @param  {Array} column width of window
   * [playRecord description]
   */
  playDrumAni(column) {
    for (let i = 0; i < column.length; i += 1) {
      this.ani.trigger(column[i]);
    }
  }

  /**
   * [detectKeyboard description]
   */
  detectKeyboard() {
    key('a', () => {
      this.keyboard.currentKey = 1;
      this.keyboard.playKey();
      this.ani.trigger(1);
    });
    key('s', () => {
      this.keyboard.currentKey = 2;
      this.keyboard.playKey();
      this.ani.trigger(2);
    });
    key('d', () => {
      this.keyboard.currentKey = 3;
      this.keyboard.playKey();
      this.ani.trigger(3);
    });
    key('f', () => {
      this.keyboard.currentKey = 4;
      this.keyboard.playKey();
      this.ani.trigger(4);
    });
    key('q', () => {
      this.keyboard.currentKey = 5;
      this.keyboard.playKey();
      this.ani.trigger(5);
    });
    key('w', () => {
      this.keyboard.currentKey = 6;
      this.keyboard.playKey();
      this.ani.trigger(6);
    });
    key('e', () => {
      this.keyboard.currentKey = 7;
      this.keyboard.playKey();
      this.ani.trigger(7);
    });
    key('r', () => {
      this.keyboard.currentKey = 8;
      this.keyboard.playKey();
      this.ani.trigger(8);
    });
    key('t', () => {
      this.keyboard.currentKey = 9;
      this.keyboard.playKey();
      this.ani.trigger(9);
    });
  }

	/**
   * [toggleHidden description]
   */
  toggleHidden() {
    this.setState({
      hidden: !this.state.hidden,
    });
  }

  /**
   * [renderPatterns description]
   * @return {Element}
   */
  renderPatterns() {
    return _.map(this.state.patternLists, pattern => (
      <li
        key={uuid4()}
        onTouchTap={() => this.playPattern(pattern)}
        style={{ color: 'white' }}
      >
        <h4>{pattern.title}</h4>
      </li>
    ));
  }

  /**
   * [renderRecords description]
   * @return {Element}
   */
  renderRecords() {
    return _.map(this.state.records, record => (
      <li
        key={uuid4()}
        onTouchTap={() => this.playRecord(record.content)}
        style={{ color: 'black' }}
      >
        <h4>{record.title}{record.content.length}</h4>
      </li>
    ));
  }

  /**
   * [renderChain description]
   * @return {Element}
   */
  renderChain() {
    return _.map(this.state.drumNoteChain, chainElement => (
      <li
        key={chainElement.id}
        style={{ color: 'yellow' }}
        onTouchTap={() => this.setCurrentChainElementAtHere(chainElement.id)}
      >
        <h4>{chainElement.id + chainElement.data}</h4>
      </li>
    ));
  }

  /**
   * [render description]
   * @return {Element}
   */
  render() {
		const { hidden, wait } = this.state;
    return (
      <div className={(wait === true) ? styles.hideDOM : styles.showDOM}>
        <NavigationMenuIcon
          className={
						`${styles.icon}
						 ${styles.menuIcon}
						 ${(hidden === true) ? '' : styles.displayHide}`
					}
          onClick={() => this.toggleHidden()}
          style={{ color: '#eecdcc' }}
        />
        <NavigationRefreshIcon
          className={
						`${styles.icon}
						 ${styles.clearIcon}
						 ${(hidden === true) ? '' : styles.displayHide}`
					}
          onClick={() => this.clearClicked()}
          style={{ color: '#eecdcc' }}
        />
        <AVShuffleIcon
          className={
						`${styles.icon}
						 ${styles.randomIcon}
						 ${(hidden === true) ? '' : styles.displayHide}`
					}
          onClick={() => this.randomClicked()}
          style={{ color: '#eecdcc' }}
        />

        <div
          className={
					`${styles.menu}
					 ${(hidden === true) ? styles.toggleRevMenu : styles.toggleMenu}`
				  }
        >
          <NavigationCloseIcon
            className={styles.closeIcon}
            onClick={() => this.toggleHidden()}
          />
          <div className={styles.patternList}>
						renderPatterns in this div
            <ul>
              {this.renderPatterns()}
            </ul>
          </div>
          <div className={styles.chainList}>
						renderChain in this div
						<ul>{this.renderChain()}<li style={{ color: 'yellow' }} onTouchTap={() => this.setCurrentChainElementAtLast()}>
		            Update at here in this li
		          </li>
		        </ul>
          </div>
          <div className={styles.patternList}>
            renderRecords in this div
            <ul>
              {this.renderRecords()}
            </ul>
          </div>
          <div className={styles.menuBtn}>
            <div
              className={styles.btn}
              onTouchTap={() => this.startSequencer()}
            >
	            start
	          </div>
            <div
              className={styles.btn}
              onTouchTap={() => this.stopSequencer()}
            >
	            stop
	          </div>
            <div
              className={styles.btn}
              onTouchTap={() => this.recordSequencer()}
            >
	            Record
	          </div>
            <div
              className={styles.btn}
              onTouchTap={() => this.saveRecord()}
            >
	            Save
	          </div>
            <div
              className={styles.btn}
              onTouchTap={() => this.clearRecord()}
            >
	            Clear Current Record
	          </div>
            <div
              className={styles.btn}
              onTouchTap={() => this.exitPlayRecord()}
            >
              Exit Playing Record
            </div>

            <div>
              <div>
                <input
                  type="text"
                  value={this.state.patternTitle}
                  onChange={this.handleTitleChange}
                />
              </div>
              <div
                className={styles.btn}
                onTouchTap={() => this.savePattern()}
              >
                Save New Pattern
              </div>
              <div
                className={styles.btn}
                onTouchTap={() => this.editPattern()}
              >
                Update Pattern
              </div>
            </div>

            <div
              className={styles.btn}
              onTouchTap={() => this.deleteCurrentPattern()}
            >
              Delete Current Pattern
            </div>

            <div
              className={styles.btn}
              onTouchTap={() => this.exitPattern()}
            >
              Exit Pattern
            </div>

            <div
              className={styles.btn}
              onTouchTap={() => this.updateChain()}
            >
              Update Chain
            </div>
            <div
              className={styles.btn}
              onTouchTap={() => this.deleteCurrentChainElement()}
            >
              Delete Current Chain Element
            </div>
            <div
              className={styles.btn}
              onTouchTap={() => this.playChain()}
            >
              Play Chain
            </div>
            <div
              className={styles.btn}
              onTouchTap={() => this.exitChain()}
            >
              Exit Chain
            </div>
          </div>
          <hr />
          <div>
            <br />
            <br />
						user guide
					</div>
        </div>
        <div
          role="button"
          tabIndex="0"
          className={
						`${styles.mask}
						 ${(hidden === false ? styles.showMask : styles.hideMask)}`}
          onClick={() => this.toggleHidden()}
        />
        <Matrix
          data={this.state.data}
          playing={this.state.playing}
          currentBeat={this.state.currentBeat}
          onClick={(i, j) => this.handleClick(i, j)}
        />
        <div className={styles.animation} id="animation" />
        <WindowResizeListener
          onResize={w => this.handleResize(w.windowWidth, w.windowHeight)}
        />
        <div>
          <input
            type="text" id="one"
            onKeyPress={this.detectKeyboard}
          />
        </div>
      </div>
    );
  }

}

export default DrumMachine;
