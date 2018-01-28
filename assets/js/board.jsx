import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';

// App state for Board is:
//   { tiles: [List of Tiles],
//    tilesMatched: Integer,
//    selectedTiles: [List of Tiles],
//    score: Integer,
//    clicks: Integer,
//    paused: Bool
//    }
//
// A Tile is:
//   { val: String,
//     flipped: Bool,
//     matched: Bool,
//     id: Integer
//   }

export default function play_game(root){
  ReactDOM.render(<Board />, root);
}

class Board extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      tiles: [],
      tilesMatched: 0,
      selectedTiles: [],
      score: 0,
      clicks: 0,
      paused: false
    };

    this.newTiles = this.newTiles.bind(this);

  }
  //executes newTiles() on page load
  componentDidMount(){
    window.addEventListener('load', this.newTiles);
  }


  //shuffles the cards and generates a new board
  newTiles() {
    var alphabets = ["A","A","B","B","C","C","D","D","E","E","F","F","G","G","H","H"];
    var rand;
    var temp;

    //shuffles the array
    for (var i=alphabets.length-1; i>=0; i--){
      rand = Math.floor(Math.random() * alphabets.length);
      temp = alphabets[rand];
      alphabets[rand] = alphabets[i];
      alphabets[i] = temp;
    }

    let newtiles = [];

    //adds Tiles to a new array
    for (var j = 0; j<alphabets.length; j++){
      let newtile = { val: alphabets[j], flipped: false, matched: false, id: j};
      newtiles.push(newtile);
    }

    //sets the tiles in the state to the new array

    this.setState({tiles: newtiles,
                  tilesMatched: 0,
                  selectedTiles: [],
                  score: 0,
                  clicks: 0,
                  paused: false
                })


  }

//handles the click events on tiles
  clickTile(card) {
    //if the game is not paused or card has not matched or isnt flipped
    // do the following
    if(!this.state.paused){
      if(!card.matched){
        if(!card.flipped){
          //clone selected tiles array
          let tilesSelected = this.state.selectedTiles.slice();

          //if not more than 2 tiles are selected, do the following
          if (tilesSelected.length<2){
            this.flipCard(card);
            let clickedTile = card;
            tilesSelected.push(clickedTile);
            let st;
            let clicks = this.state.clicks;
            clicks = clicks + 1;

            if(tilesSelected.length==2){
                st = _.extend(this.state, {
                  selectedTiles: tilesSelected,
                  paused: true,
                  clicks: clicks
                });
                setTimeout(() => {this.checkMatch()}, 1000);
              } else {
                st = _.extend(this.state, {
                  selectedTiles: tilesSelected,
                  clicks: clicks
                });
              }

            this.setState(st);
        }
      }
    }
  }
}


  flipCard(card){

    let xs = _.map(this.state.tiles, (tile) =>{
      if (tile.id == card.id) {
        return _.extend(tile, {flipped: !card.flipped});
      } else {
        return tile;
      }
    });

    let st = _.extend(this.state, {
      tiles: xs
    });

    this.setState(st);

  }

  checkMatch(){

    let selectedTiles = this.state.selectedTiles.slice();
    let newScore = this.state.score;
    if(selectedTiles[0].val == selectedTiles[1].val){
      //matched - success
      let id1 = selectedTiles[0].id;
      let id2 = selectedTiles[1].id;
      let xs = _.map(this.state.tiles, (tile) => {
        if(tile.id == id1 || tile.id == id2){
          return _.extend(tile, {matched: true});
        } else {
          return tile;
        }
      });

      let matched = this.state.tilesMatched;
      matched = matched + 2;

      newScore = newScore + 20;

      let st = _.extend(this.state, {
        tiles: xs,
        tilesMatched: matched,
        score: newScore,
        paused: false
      });

      this.setState(st);

      if(matched == this.state.tiles.length){

      }
      console.log(this.state)

    } else {
      //reflip
      newScore = newScore - 5;
     for (var i=0; i<selectedTiles.length; i++){
          this.flipCard(selectedTiles[i]);
        }
        let st = _.extend(this.state, {
          score: newScore,
          paused: false
        });

        this.setState(st);

    }

    let newSelected = [];
    let st1 = _.extend(this.state, {
      selectedTiles: newSelected
    })

  }


  render() {
    let tile_list = _.map(this.state.tiles, (tile, ii) => {
      return <Tile card={tile} clickTile={this.clickTile.bind(this)} key={ii} />;
    });

    let game_over = <div></div>;
    let tileCount = this.state.tiles.length;
    if(tileCount>0 && tileCount == this.state.tilesMatched){
      game_over = <Popup score={this.state.score} restart={this.newTiles.bind(this)} />;
    }


    return (
      <div className="game">
        {game_over}
        <div className="grid-container">
          {tile_list}
        </div>
        <div className="below">
          <div className="below-content">
            <Button id="reset" onClick={this.newTiles.bind(this)}>Restart</Button>
            <p id="score">Score: {this.state.score}</p>
        </div>
        </div>
      </div>
    )
  };

}

function Popup(props){
  let score=props.score;
  return(
      <div className="popup">
        <div className="popup-content">
        <h1>You Win!</h1>
        <h3>Your score is {score}</h3>
        <Button className="play-again" onClick={() => props.restart()}>Play Again?</Button>
      </div>
    </div>
  )
}


function Tile(props) {

  let card1 = props.card;
  var name;
  let style;
  if(card1.matched){
    style = "tile-matched"
    name = "✔"
  } else {
    style = "tile"
      if(card1.flipped){
        name = card1.val;
      } else {
        name = "?";
      }
  }
  return <Button className={style} val={card1.val} id={card1.id} onClick={() => props.clickTile(card1)}>{name}</Button>
}
