// React dependency
import React, { Component } from 'react';

// Css dependency
import './bootstrap.min.css';
import './App.css';

// Underscore.js dependency
import * as _ from 'underscore/underscore';

// Font-Awesome dependency
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faCheck, faTimes, faSyncAlt } from '@fortawesome/free-solid-svg-icons'
library.add(faStar, faCheck, faTimes, faSyncAlt)



var possibleCombinationSum = function(arr, n) {
  if (arr.indexOf(n) >= 0) { return true; }
  if (arr[0] > n) { return false; }
  if (arr[arr.length - 1] > n) {
    arr.pop();
    return possibleCombinationSum(arr, n);
  }
  var listSize = arr.length, combinationsCount = (1 << listSize)
  for (var i = 1; i < combinationsCount ; i++ ) {
    var combinationSum = 0;
    for (var j=0 ; j < listSize ; j++) {
      if (i & (1 << j)) { combinationSum += arr[j]; }
    }
    if (n === combinationSum) { return true; }
  }
  return false;
};

const Stars = (props) => {
  return (
    <div className="col-5">
      {_.range(props.numberOfStars).map(i => 
        <FontAwesomeIcon key={i} icon="star" />
      )}
    </div>
  ); 
}

const Button = (props) => {
  let button;
  switch(props.answerIsCorrect) {
    case true:
      button =  <button className="btn btn-success" onClick={props.acceptAnswer}> 
                  <FontAwesomeIcon icon="check" /> 
                </button>
    break;
    case false:
      button =  <button className="btn btn-danger"> 
                  <FontAwesomeIcon icon="times" /> 
                </button>
    break;
    default:
      button =  <button className="btn" 
                        onClick={props.checkAnswer}
                        disabled={props.selectedNumbers.length === 0}> = </button>
    break;
  }

  return (
    <div className="col-2 text-center">
      {button}
      <br /><br />
      <button className="btn btn-warning btn-sm font-weight-bold" 
              onClick={props.redraw}
              disabled={props.redraws === 0}>
        <FontAwesomeIcon icon="sync-alt" className="mr-2" /> 
        {props.redraws} 
      </button>
    </div>
  ); 
}

const Answer = (props) => {
  return (
    <div className="col-5">
      {props.selectedNumbers.map((number, i) =>
        <span key={i} onClick={() => props.unselectNumber(number)}> 
          {number} 
        </span>
      )}
    </div>
  ); 
}

const Numbers = (props) => {
  const numberClassName = (number) => {
    if (props.usedNumbers.indexOf(number) >= 0) {
      return 'used';
    }
    if (props.selectedNumbers.indexOf(number) >= 0) {
      return 'selected';
    }
  }
  return (
    <div className="card text-center">
      <div>
        {Numbers.List.map((number, i) =>
          <span key={i} className={numberClassName(number)}
                onClick={() => props.selectNumber(number)}> 
            {number} 
          </span>
        )}
      </div>
    </div>
  );
}

Numbers.List = _.range(1, 10);

const DoneFrame = (props) => {
  return (
    <div className="text-center">
      <h2> {props.doneStatus} </h2>
      <button className="btn btn-seconday" onClick={props.resetGame}> 
        Play Again 
      </button>
    </div>
  );
}

class Game extends Component {
  static randomNumber = () => 1 + Math.floor(Math.random()*9);
  static initialState = () => ({
    selectedNumbers: [],
    randomNumberOfStars: Game.randomNumber(),
    usedNumbers: [],
    answerIsCorrect: null,
    redraws: 5,
    doneStatus: null,
  });
  constructor (props) {
    super(props);
    this.state = Game.initialState();

    this.resetGame = () => this.setState(Game.initialState());
    
    this.selectNumber = (clickedNumber) => {
      if (this.state.selectedNumbers.indexOf(clickedNumber) >= 0) {
        return;
      }
      this.setState(prevState => ({
        answerIsCorrect: null,
        selectedNumbers: prevState.selectedNumbers.concat(clickedNumber)
      }));
    }

    this.unselectNumber = (clickedNumber) => {
      this.setState(prevState => ({
        answerIsCorrect: null,
        selectedNumbers: prevState.selectedNumbers
                                  .filter(number => number !== clickedNumber)
      }));
    }

    this.checkAnswer = () => {
      this.setState(prevState => ({
        answerIsCorrect: prevState.randomNumberOfStars === 
                          prevState.selectedNumbers.reduce((acc, n) => acc + n, 0)
      }));
    }

    this.acceptAnswer = () => {
      this.setState(prevState => ({
        usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
        selectedNumbers: [],
        answerIsCorrect: null,
        randomNumberOfStars: Game.randomNumber(),
      }), this.updateDoneStatus);
    }

    this.redraw = () => {
      if (this.state.redraws === 0) { 
        return; 
      }
      this.setState(prevState => ({
        randomNumberOfStars: Game.randomNumber(),
        answerIsCorrect: null,
        selectedNumbers: [],
        redraws: prevState.redraws - 1,
      }), this.updateDoneStatus);
    }

    this.possibleSolutions = ({randomNumberOfStars, usedNumbers}) => {
      const possibleNumbers = _.range(1, 10).filter(number => 
        usedNumbers.indexOf(number) === -1
      );
      return possibleCombinationSum(possibleNumbers, randomNumberOfStars);
    }

    this.updateDoneStatus = () => {
      this.setState(prevState => {
        if(prevState.usedNumbers.length === 9) {
          return { doneStatus: 'Done. Nice!'};
        }
        if (prevState.redraws === 0 && !this.possibleSolutions(prevState)) {
          return { doneStatus: 'Game Over!'};
        }
      });
    }

  }

  render() {

    const { 
      selectedNumbers, 
      randomNumberOfStars, 
      answerIsCorrect, 
      usedNumbers,
      redraws,
      doneStatus,
    } = this.state;

    return (
      <div className="container-fluid">
        <h3> Play Nine </h3>
        <div className="row">
          <Stars numberOfStars={randomNumberOfStars} />
          <Button selectedNumbers={selectedNumbers}
                  redraws={redraws} 
                  checkAnswer={this.checkAnswer}
                  answerIsCorrect={answerIsCorrect}
                  redraw={this.redraw}
                  acceptAnswer={this.acceptAnswer} />
          <Answer selectedNumbers={selectedNumbers}
            unselectNumber={this.unselectNumber} />
        </div>
        <br />
        {
          doneStatus 
          ? 
            <DoneFrame resetGame={this.resetGame} doneStatus={doneStatus} /> 
          :  
            <Numbers selectedNumbers={selectedNumbers}
                      selectNumber={this.selectNumber}
                      usedNumbers={usedNumbers} />
        }      
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div>
        <Game />
      </div>
    );
  }
}

export default App;
