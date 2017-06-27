import React from 'react';
import PropTypes from 'prop-types';
import uuid4 from 'uuid/v4';
import styles from '../assets/styles/Matrix.css';
import Row from './Row';

let timeoutID;
let idle = false;
/* eslint-disable no-use-before-define */
/**
 * [mouseTimerSetup description]
 */
function mouseTimerSetup() {
	window.addEventListener('mousemove', resetTimer, false);
	// window.addEventListener('mousedown', resetTimer, false);
	// window.addEventListener('keypress', resetTimer, false);
	// window.addEventListener('DOMMouseScroll', resetTimer, false);
	// window.addEventListener('mousewheel', resetTimer, false);
	// window.addEventListener('touchmove', resetTimer, false);
	// window.addEventListener('MSPointerMove', resetTimer, false);
	timeoutID = window.setTimeout(firstGoInactive, 12000);
	// startTimer();
}
mouseTimerSetup();
/**
 * [goActive description]
 */
function goActive() {
	startTimer();
}
/**
 * [goInActive description]
 */
function goInactive() {
	console.log('you have idled for 3s');
	idle = true;
	startTimer();
}
/**
 * [firstGoInActive description]
 * wait 12s if mouse idle at first
 */
function firstGoInactive() {
	console.log('you have idled for 12s');
	idle = true;
	startTimer();
}
/**
 * [startTimer description]
 */
function startTimer() {
	timeoutID = window.setTimeout(goInactive, 3000);
}
/**
 * [resetTimer description]
 */
function resetTimer() {
	window.clearTimeout(timeoutID);
	idle = false;
	goActive();
}
/* eslint-enable no-use-before-define */

const Matrix = (props) => {
  const { data, onClick, currentBeat, playing } = props;
  return (
    <div
      className={
			`${styles.matrix}
			 ${(idle === true) ? styles.idle : ''}`}
			 >
      {data.map((row, i) =>
        <Row
          data={row}
					key={`row-${i}-${row[0][0]}`}
          current={currentBeat === i}
          onClick={j => onClick(i, j)}
          playing={playing}
        />,
      )}
    </div>
  );
};

Matrix.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.number,
    ).isRequired,
  ).isRequired,
  currentBeat: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
	playing: PropTypes.bool.isRequired,
};


export default Matrix;
