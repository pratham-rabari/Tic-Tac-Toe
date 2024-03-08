import React, { useEffect, useState } from 'react'
import './style/Chat.css'
import EmojiPicker from 'emoji-picker-react'

const Chat = ({ opponentName, socket, oppoId }) => {

    const [input, setInput] = useState("")
    const [messages, setMessages] = useState([])
    const [curInput, setCurInput] = useState([])
    const [show, setShow] = useState(false)
    const [emoji, setEmoji] = useState("")

    const SendMessage = () => {
        if (input === "") {
            return alert("Please Write Something")
        }
        socket?.emit("Send-Message", { input, oppoId })
        setCurInput((curInput) => [...curInput, input])
        setMessages((message) => [...message, input])
        setInput("")
        setShow(false)
    }

    socket?.on("recive-message", (data) => {
        setMessages([...messages, data.data.input])
    })

    useEffect(() => {
         setInput(input + (emoji ? emoji : ""))
        setEmoji("")
    }, [emoji])

    return (
        <>
            <div>
                <h4 className='mx-2 my-1 text-light'>{opponentName}</h4>
            </div><hr />
            <div className="chats">
                {
                    messages?.map((msg, i) => (
                        <>
                            <div className={`rounded my-2 mx-2 mt-2  ${curInput.includes(msg) ? "send" : "recieve"}`} key={i}><p className='text-center my-1 mx-1'>{msg}</p></div><br /><br />

                        </>
                    ))
                }
            </div>
            {
                show ? <div className='emoji-box'><EmojiPicker
                    theme='dark'
                    onEmojiClick={(e) => { setEmoji(e.emoji) }}
                    searchDisabled
                /></div> : ""
            }
            <div className='d-flex inputbox my-1'>
                <input className='input px-2' placeholder='Send Message' onChange={(e) => { setInput(e.target.value) }} value={input} />
                <span className='mx-1 my-1'>
                    <img src="https://cdn-icons-png.flaticon.com/128/742/742751.png" className='img' onClick={() => { setShow(true) }} />
                </span>
                <button className='btn2 rounded' onClick={SendMessage}><img src="https://cdn-icons-png.flaticon.com/128/876/876777.png" className='img text-center' /></button>
            </div>
        </>
    )
}

export default Chat
