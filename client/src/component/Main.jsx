import React, { useState, useEffect, useMemo } from 'react'
import './style/Main.css'
import Square from './Square'
import { io } from "socket.io-client";
import Swal from 'sweetalert2'
import Chat from './Chat';

const Main = () => {
    const player = localStorage.getItem("tic-tac-toe user")
    const [finishState, setFinishState] = useState("")
    const [finishArrayState, setFinishArrayState] = useState([])
    const [playonline, setPlayonline] = useState(false)
    const [socket, setSocket] = useState(null)
    const [oppenentName, setOppenentName] = useState(null)
    const [playerName, setPlayerName] = useState("")
    const [playingSign, setPlayingSign] = useState('')
    const [showChatBox,setShowChatBox]= useState(true)
    const[oppoId,setOppoId]=useState("")

    const renderFrom = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
    ];
    const [gamestate, setGamestate] = useState(renderFrom)
    const [currentPlayer, setCurrentPlayer] = useState('circle')

    const checkWinner = () => {
        for (let row = 0; row < gamestate.length; row++) {
            if (gamestate[row][0] === gamestate[row][1] && gamestate[row][1] === gamestate[row][2]) {
                setFinishArrayState([row * 3 + 0, row * 3 + 1, row * 3 + 2])
                return gamestate[row][0];
            }
            if (gamestate[0][row] === gamestate[1][row] && gamestate[1][row] === gamestate[2][row]) {
                setFinishArrayState([0 * 3 + row, 1 * 3 + row, 2 * 3 + row])
                return gamestate[0][row];
            }
            if (gamestate[0][0] === gamestate[1][1] && gamestate[1][1] === gamestate[2][2]) {
                setFinishArrayState([0, 4, 8])
                return gamestate[0][0]
            }
            if (gamestate[0][2] === gamestate[1][1] && gamestate[1][1] === gamestate[2][0]) {
                setFinishArrayState([2, 4, 6])
                return gamestate[2][2]
            }
            const isDraw = gamestate.flat().every((e) => {
                if (e === "circle" || e === "cross") {
                    return true;
                }
            })
            if (isDraw) {
                return 'Draw'
            }
        }
    }
    useEffect(() => {
        const winner = checkWinner()
        if (winner) {
            setFinishState(winner)
            setShowChatBox(false)
        }
    }, [gamestate])


    socket?.on("connect", () => {
        setPlayonline(true)
    });

    socket?.on("oppenent-found", (data) => {
        setOppenentName(data.name)
        setPlayingSign(data.playingas)
        setOppoId(data.curr)
    })

    socket?.on("oppenent-not-found", () => {
        setOppenentName(false)
    })

    socket?.on("playerMoveFromServer", (data) => {
        const id = data.state.id
        setGamestate((prev) => {
            let newState = [...prev]
            const rowindex = Math.floor(id / 3)
            const colindex = id % 3;
            newState[rowindex][colindex] = data.state.sign;
            return newState
        })
        setCurrentPlayer(data.state.sign === 'circle' ? "cross" : "circle");
    })

    const PlayOnlineClick = async () => {
        const result = await takePlayerName();

        if (!result.isConfirmed) {
            return
        }
        const username = result.value;
        setPlayerName(username)
        const newsocket = io("http://localhost:3000", {
            autoConnect: true,
        })
        setSocket(newsocket)
        newsocket?.emit("request-to-play", {
            username,socket
        })
    }
    const takePlayerName = async () => {
        const result = await Swal.fire({
            title: "Enter your Name",
            input: "text",
            showCancelButton: true,
            inputValidator: (value) => {
                setPlayerName(value)
                if (!value) {
                    return "You need to write something!";
                }
            }
        });
        return result;
    }

    if (!playonline) {
        return <div className='text-center my-4 startbox'>
            <div className='d-flex justify-content-center align-items-center flex-column box1 my-3'>
                <h2 className='h2'>Tic-Tac-Toe</h2>
            </div>
            <button className='btn text-center btnx my-4' onClick={PlayOnlineClick}>Play Online</button>
        </div>
    }

    if (playonline && !oppenentName) {
        return <div className='text-center w'>
            <h2 className='my-4'>Waiting for Oppenent....</h2>
        </div>
    }
    return (
        <div className='row min'>
            <div className='col-md-8'>
                <div className='d-flex justify-content-center align-items-center mt-4 flex-column color'>
                    <div>
                        <span className={`player rounded mx-4 ${finishState ? "" : currentPlayer === playingSign ? `bg` : ``}`}>{playerName}</span>
                        <span className={`player rounded mx-4 ${finishState ? "" : currentPlayer !== playingSign ? `bg` : ``}`}>{oppenentName ? oppenentName : ""}</span>
                    </div>
                    <div className='text my-3 rounded'>
                        <p className='h2h text-center'>Tic-Tac-Toe</p>
                    </div>
                    <h4> You : {playerName}</h4>
                    <h4> Oppenent : {oppenentName ? oppenentName : ""}</h4>
                    {finishState ? "" : <h3 className='mt-2'>{currentPlayer === playingSign ? playerName : oppenentName}'s turn</h3>}
                </div>
                <div className='d-flex justify-content-center my-3'>
                    <div className='row gameboard'>
                        {
                            gamestate.map((item, rowindex) =>
                                item.map((e, colindex) => {
                                    return <Square
                                        socket={socket}
                                        gamestate={gamestate}
                                        id={rowindex * 3 + colindex}
                                        key={rowindex * 3 + colindex}
                                        setGamestate={setGamestate}
                                        currentPlayer={currentPlayer}
                                        setCurrentPlayer={setCurrentPlayer}
                                        finishState={finishState}
                                        finishArrayState={finishArrayState}
                                        currentElement={e}
                                        playingSign={playingSign}
                                    />
                                })
                            )
                        }
                    </div>
                </div>
                <h2 className='text-center color'>{finishState && finishState !== 'Draw' ? `Winner is ${finishState === playingSign ? playerName : oppenentName}` : ""}</h2>
        
                {
                    finishState && finishState === 'Draw' && (
                        <h2 className='text-center color'>Match is draw</h2>
                    )
                }
                {
                    finishState?
                    <div className='text-center my-4'>
                    <button className='btn btn-info' onClick={(()=>{setPlayonline(false)})}>Play Again</button>
                    </div>:""
                }
            </div>
           
            {showChatBox? <div className='col-md-4 chatbox'>
              <Chat opponentName={oppenentName} socket={socket} oppoId={oppoId}/>
            </div>:""}
            
        </div>
    )
}

export default Main
