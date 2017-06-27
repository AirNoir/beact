import React from 'react';
import PropTypes from 'prop-types';
import uuid4 from 'uuid/v4';
import styles from '../assets/styles/Matrix.css';

const Row = (props) => {
  const { data, current, onClick, playing } = props;
  return (
    <div
      key={uuid4()}
      className={
        `${styles.row}`
      }
    >
      {data.map((d, i) =>
        <div
          // key={uuid4()}
          key={`trigger-${i}-${d}`}
          className={
            `${styles.rect}
             ${current && playing ? styles.current : ''}
             ${data[i] === 1 ? styles.clicked : ''}`
          }
          onTouchTap={() => onClick(i)}
        />,
      )}
    </div>
  );
};

Row.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.number,
  ).isRequired,
  current: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  playing: PropTypes.bool.isRequired,
};

export default Row;
