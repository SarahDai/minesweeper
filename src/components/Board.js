import React, {  } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { GAME } from "../redux/storeConstants";
import Cell from "./Cell";
import { setGameStatus, setGameMines, setGameBoard } from "../redux/actions";

let firstLoad = true;

const Board = () => {
   const height = useSelector(state => state.game.height);
   const width = useSelector(state => state.game.width);
   const mines = useSelector(state => state.game.mines);
   const board = useSelector(state => state.game.board);
   const dispatch = useDispatch();

   const initBoard = () => {
      let newBoard = createEmptyArray();
      newBoard = plantMines(newBoard);
      newBoard = getNeighbors(newBoard);
      dispatch(setGameBoard(newBoard));
      return newBoard;
   };

   const getRand = (val) => {
      return Math.floor((Math.random() * 1000 + 1) % val);
   };

   const getTypes = (type, newBoard) => {
      let arr = [];
      newBoard.forEach(row => {
          row.forEach(item => {
              if ((type === "mine" && item.isMine) ||
                  (type === "flag" && item.isFlagged) ||
                  (type === "hide" && item.isRevealed)) {
                  arr.push(item);
              }
          });
      });
      return arr;
   };

   const createEmptyArray = () => {
      let newBoard = [];
      for (let i = 0; i < height; i++) {
         newBoard.push([]);
         for (let j = 0; j < width; j++) {
            newBoard[i][j] = {
               x: i,
               y: j,
               isMine: false,
               neighbor: 0,
               isRevealed: false,
               isEmpty: false,
               isFlagged: false,
            };
         }
      }
      return newBoard;
   };
   
   const plantMines = (newBoard) => {
      let randX = 0;
      let randY = 0;
      let minesPlanted = 0;
      while (minesPlanted < mines) {
         randX = getRand(width);
         randY = getRand(height);
         // console.log(JSON.stringify(newBoard));
         if (!newBoard[randX][randY].isMine) {
            newBoard[randX][randY].isMine = true;
            minesPlanted++;
         }
      }
      return newBoard;
   };

   const getNeighbors = (newBoard) => {
      for (let i = 0; i < height; i++) {
         for (let j = 0; j < width; j++) {
            if (!newBoard[i][j].isMine) {
               let mine = 0;
               const area = traverseBoard(newBoard[i][j].x, newBoard[i][j].y, newBoard);
               area.forEach(value => {
                  if (value.isMine) {
                     mine++;
                  }
               });
               if (mine === 0) {
                  newBoard[i][j].isEmpty = true;
               }
               newBoard[i][j].neighbor = mine;
            }
         }
      }
      return newBoard;
   };

   const traverseBoard = (x, y, newBoard) => {
      const cur = [];
      if (x > 0) {
         cur.push(newBoard[x - 1][y]);
      }
      if (x < height - 1) {
         cur.push(newBoard[x + 1][y]);
      }
      if (y > 0) {
         cur.push(newBoard[x][y - 1]);
      }
      if (y < width - 1) {
         cur.push(newBoard[x][y + 1]);
      }
      if (x > 0 && y > 0) {
         cur.push(newBoard[x - 1][y - 1]);
      }
      if (x > 0 && y < width - 1) {
         cur.push(newBoard[x - 1][y + 1]);
      }
      if (x < height - 1 && y < width - 1) {
         cur.push(newBoard[x + 1][y + 1]);
      }
      if (x < height - 1 && y > 0) {
         cur.push(newBoard[x + 1][y - 1]);
      }
      return cur;
   };

   const renderBoard = () => {
      let newBoard = board;
      if (firstLoad) {
         firstLoad = false;
         newBoard = initBoard();  
      }
      return newBoard.map((row) => {
         return row.map((item) => {
            return (
               <div key={item.x * row.length + item.y}>
                  <Cell onClick={() => handleClick(item.x, item.y)}
                        onContextMenu={(e) => handleContextMenu(e, item.x, item.y)}
                        value={item}
                  />
                  {(row[row.length - 1] === item) ? <div/> : ""}
               </div>
            )
         })
      })
   };

   const revealBoard = (newBoard) => {
      newBoard.forEach(row => {
         row.forEach(item => {
            item.isRevealed = true;
         });
      });
      return newBoard;
   }

   const handleClick = (x, y) => {
      if (board[x][y].isRevealed || board[x][y].isFlagged) {
         return null;
      }
      let newBoard = [...board];
      if (newBoard[x][y].isMine) {
         dispatch(setGameStatus(GAME.LOSE));
         newBoard = revealBoard(newBoard);
         alert("game over");
      }
      newBoard[x][y].isFlagged = false;
      newBoard[x][y].isRevealed = true;
      if (newBoard[x][y].isEmpty) {
         newBoard = revealEmpty(x, y, newBoard);
      }
      if (getTypes("hide", newBoard).length === mines) {
         dispatch(setGameStatus(GAME.WIN));
         newBoard = revealBoard(newBoard);
         alert("you win");
      }
      dispatch(setGameBoard(newBoard));
      dispatch(setGameMines(mines - getTypes("flag", newBoard).length));
   };

   const revealEmpty = (x, y, newBoard) => {
      let area = traverseBoard(x, y, newBoard);
      area.forEach(value => {
         if (!value.isFlagged && !value.isRevealed && (value.isEmpty || !value.isMine)) {
            newBoard[value.x][value.y].isRevealed = true;
            if (value.isEmpty) {
               revealEmpty(value.x, value.y, newBoard);
            }
         }
      });
      return newBoard;
   };

   const handleContextMenu = (e, x, y) => {
      e.preventDefault();
      let newMines = mines;
      let newBoard = [...board];
      if (newBoard[x][y].isRevealed) {
         return;
      }
      if (newBoard[x][y].isFlagged) {
         newBoard[x][y].isFlagged = false;
         newMines++;
      } else {
         newBoard[x][y].isFlagged = true;
         newMines--;
      }
      if (newMines === 0) {
         const mineArr = getTypes("mine", newBoard);
         const flagArr = getTypes("flag", newBoard);
         if (JSON.stringify(mineArr) === JSON.stringify(flagArr)) {
            newBoard = revealBoard(newBoard);
            alert("you win");
         }
      }
      dispatch(setGameBoard(newBoard));
      dispatch(setGameMines(newMines));
   };

   return (
      <div className="board">
         {renderBoard()}
      </div>
   );
};

export default Board;