import React, { useContext, useState, useEffect, createRef, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { UserContext } from '../context/User.context';
import axios from '../config/axios'
import { intializeSocket, receiveMessage, sendMessage } from '../config/sokcet';
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js'
import { getWebContainer } from '../config/wabContainer';
function SyntaxHighlightedCode(props) {
    const ref = useRef(null)

    React.useEffect(() => {
        if (ref.current && props.className?.includes('lang-') && window.hljs) {
            window.hljs.highlightElement(ref.current)

            // hljs won't reprocess the element unless this attribute is removed
            ref.current.removeAttribute('data-highlighted')
        }
    }, [ props.className, props.children ])

    return <code {...props} ref={ref} />
}

const Project = () => {
    const [sidePanelOpen, setSidePanelOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const location = useLocation();
    const [selectedUserId, setSelectedUserId] = useState(new Set());
    const { user } = useContext(UserContext);

    const [users, setUsers] = useState([])
    const [project, setProject] = useState(location.state.project);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([])
    const [fileTree, setFileTree] = useState({})

    const [currentFile, setCurrentFile] = useState(null)
    const [openFiles, setOpenFiles] = useState([])

    const [webContainer, setWebContainer] = useState(null)
    const [iframeUrl, setIframeUrl] = useState(null)

    const [runProcess, setRunProcess] = useState(null)
    const messageBox = createRef();

    const handleUserClick = (id) => {
        setSelectedUserId(prevSelectedUserId => {
            const newSelectedUserId = new Set(prevSelectedUserId);
            if (newSelectedUserId.has(id)) {
                newSelectedUserId.delete(id);
            } else {
                newSelectedUserId.add(id);
            }

            return newSelectedUserId;
        });
    }
    function addCollaborators() {
        if (!location?.state?.project?._id || selectedUserId.size === 0) {
            console.error("Invalid project ID or no users selected");
            alert("Please select at least one user to add.");
            return;
        }
        axios.put('/projects/add-user', {
            projectId: location.state.project._id,
            users: Array.from(selectedUserId)
        }).then(res => {
            console.log(res.data);
            setIsModalOpen(false)
        }).catch(err => {
            console.error("Error adding collaborators:", err.response?.data || err.message);
            alert(err.response?.data?.message || "Failed to add collaborators.");
        });
    }

    function send() {

        sendMessage('project-message', {
            message,
            sender: user
        })
        setMessages(prevMessages => [...prevMessages, { sender: user, message }]) // Update messages state
        setMessage("")
    }
    function WriteAiMessage(message) {

        const messageObject = message

        return (
            <div
                className='overflow-auto bg-slate-950 text-white rounded-sm p-2'
            >
                <Markdown
                    children={messageObject.text}
                    options={{
                        overrides: {
                            code: SyntaxHighlightedCode,
                        },
                    }}
                />
            </div>)
    }
    useEffect(() => {
        
        intializeSocket(project._id);
        if (!webContainer) {
            getWebContainer().then(container => {
                setWebContainer(container)
                console.log("container started")
            })
        }

        console.log(location.state.project)

        receiveMessage('project-message', data => {
            console.log(data);
            


            if (data.sender._id === 'ai') {
                try {
                    // Ensure data.message is a string
                    // if (typeof data.message !== 'string') {
                    //     throw new Error('data.message is not a string');
                    // }

                    // Attempt to parse the message

                    console.log(data.message);
                    const message = data.message;
                    console.log(message);
                    console.log(message.fileTree)
                    webContainer?.mount(message.fileTree)

                    // Mount the file tree if it exists
                    if (message.fileTree) {
                        webContainer?.mount(message.fileTree);
                        setFileTree(message.fileTree || {});
                    }

                    // Update messages state
                    setMessages(prevMessages => [...prevMessages, data]);
                } catch (error) {
                    console.error('Failed to parse data.message:', error);
                    console.error('Invalid message content:', data.message);

                    // Optionally, you can add the raw message to the state for debugging
                    setMessages(prevMessages => [...prevMessages, { ...data, error: 'Invalid JSON' }]);
                }
            } else {
                // Handle non-AI messages
                setMessages(prevMessages => [...prevMessages, data]);
            }
        });

        axios.get(`/projects/get-project/${location.state.project._id}`).then(res => {

            setProject(res.data.project);


        }).catch(err => {
            console.log(err);
        })

        axios.get('/users/all').then(res => {
            setUsers(res.data.users)
        }).catch(err => {
            console.log(err)
        })
    }, [])
    function saveFileTree(ft) {
        axios.put('/projects/update-file-tree', {
            projectId: project._id,
            fileTree: ft
        }).then(res => {
            console.log(res.data)
        }).catch(err => {
            console.log(err)
        })
    }

    // function appendIncomingMessage(messageObject){
    //     const messageBox = document.querySelector('.message-box')
    //     const message = document.createElement('div');

    //     message.classList.add('message', 'incoming-message', 'max-w-56', 'flex', 'flex-col', 'p-2', 'bg-slate-50', 'w-fit', 'rounded-md')
    //     if(messageObject.sender._id === 'ai'){
    //         const markDown = (<Markdown>{messageObject.message}</Markdown>)
    //         message.innerHTML = `
    //         <small class='opacity-65 text-xs' >${messageObject.sender.email} </small>
    //         <p class='text-sm'>${markDown}</p>
    //         `
    //     }
    //     else {
    //     message.innerHTML = `
    //         <small class='opacity-65 text-xs'>${messageObject.sender.email}</small>
    //         <p class='text-sm'>${messageObject.message}</p>
    //         `
    //     }
    //     messageBox.appendChild(message)
    //     scrollToBottom()
    // }
    // function appendOutgoingMessage(message) {
    //     const messageBox = document.querySelector('.message-box')
    //     const newMessage = document.createElement('div')
    //     newMessage.classList.add('ml-auto', 'outgoing-message', 'max-w-56', 'message', 'flex', 'flex-col', 'p-2', 'bg-lime-100', 'w-fit', 'rounded-md')
    //     newMessage.innerHTML = `
    //                 <small class='opacity-65 text-xs'>${user.email}</small>
    //                 <p class='text-sm'>${message}</p>
    //             `
    //     messageBox.appendChild(newMessage)
    //     scrollToBottom()

    // }
    function scrollToBottom() {
        if (messageBox.current) {
            messageBox.current.scrollTop = messageBox.current.scrollHeight;
        }
    }



    return (
        <main className='h-screen w-screen flex'>
            <section className='left relative flex flex-col h-screen min-w-96 bg-slate-300'>
                <header className='flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute z-10 top-0'>
                    <button
                        className='flex gap-2' onClick={() => setIsModalOpen(true)}>
                        <i className="ri-add-fill mr-1"></i>
                        <p>Add collaborator</p>
                    </button>
                    <button
                        onClick={() => setSidePanelOpen(!sidePanelOpen)}
                        className='p-2'>
                        <i className="ri-group-fill"></i>
                    </button>
                </header>
                <div className='conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative'>
                    <div
                        ref={messageBox}
                        className='message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide no-scrollbar'
                    >
                        {messages.map((msg, index) => (
                            <div key={index} className={`${msg.sender._id === 'ai' ? 'max-w-80' : 'max-w-52'} ${msg.sender._id == user._id.toString() && 'ml-auto bg-green-300'}  message flex flex-col p-2 bg-slate-50 w-fit rounded-md`}>
                                <small className='opacity-65 text-xs'>{msg.sender.email}</small>
                                <div className='text-sm'>
                                    {msg.sender._id === 'ai' ?
                                        WriteAiMessage(msg.message)
                                        : <p>{msg.message}</p>}
                                </div>
                            </div>
                        ))}

                    </div>
                    <div className="inputfield w-full flex absolute bottom-0">
                        <input
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                            }}
                            className='p-2 px-4 border-none outline-none flex-grow' type="text" placeholder='Enter Message' />
                        <button
                            onClick={send}
                            className=' px-5 bg-slate-950 text-white'
                        >
                            <i className="ri-send-plane-fill"></i>
                        </button>
                    </div>
                </div>
                {sidePanelOpen && <div className={`sidePanel flex flex-col gap-2 w-full h-full bg-slate-50 absolute transition-all  ${sidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0`}>
                    <header className='flex justify-between items-center px-4 p-2 bg-slate-200'>
                        <h1
                            className='font-semibold text-lg'
                        >Collaborators</h1>
                        <button onClick={() => setSidePanelOpen(!sidePanelOpen)} className='p-2'>
                            <i className="ri-close-fill"></i>
                        </button>
                    </header>
                    <div className="users flex flex-col gap-2">
                        {project.users && project.users.map(user => (

                            <div key={user._id} className="user cursor-pointer p-2 hover:bg-slate-200 flex gap-2 items-center rounded-full">
                                <div className='aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-500'>
                                    <i className='ri-user-fill absolute'></i>
                                </div>
                                <h1
                                    className='font-semibold text-lg'
                                >{user.email}</h1>
                            </div>
                        ))}


                    </div>
                </div>}
            </section>
            <section className="right  bg-red-50 flex-grow h-full flex">

                <div className="explorer h-full max-w-64 min-w-52 bg-slate-200">
                    <div className="file-tree w-full">
                        {
                            Object.keys(fileTree).map((file, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentFile(file)
                                        setOpenFiles([...new Set([...openFiles, file])])
                                    }}
                                    className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 w-full">
                                    <p
                                        className='font-semibold text-lg'
                                    >{file}</p>
                                </button>))

                        }
                    </div>

                </div>


                <div className="code-editor flex flex-col flex-grow h-full shrink">

                    <div className="top flex justify-between w-full">

                        <div className="files flex">
                            {
                                openFiles.map((file, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentFile(file)}
                                        className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 bg-slate-300 ${currentFile === file ? 'bg-slate-400' : ''}`}>
                                        <p
                                            className='font-semibold text-lg'
                                        >{file}</p>
                                    </button>
                                ))
                            }
                        </div>

                        <div className="actions flex gap-2">
                            <button
                                onClick={async () => {
                                    console.log("fileTree is",fileTree);
                                    await webContainer?.mount(fileTree)


                                    const installProcess = await webContainer?.spawn("npm", ["install"])



                                    installProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                            console.log(chunk)
                                        }
                                    }))

                                    if (runProcess) {
                                        runProcess.kill()
                                    }

                                    let tempRunProcess = await webContainer.spawn("npm", ["start"]);

                                    tempRunProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                            console.log(chunk)
                                        }
                                    }))

                                    setRunProcess(tempRunProcess)

                                    webContainer.on('server-ready', (port, url) => {
                                        console.log(port, url)
                                        setIframeUrl(url)
                                    })

                                }}
                                className='p-2 px-4 bg-slate-300 text-white'
                            >
                                run
                            </button>


                        </div>
                    </div>
                    <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
                        {
                            fileTree[currentFile] && (
                                <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
                                    <pre
                                        className="hljs h-full">
                                        <code
                                            className="hljs h-full outline-none"
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                const updatedContent = e.target.innerText;
                                                const ft = {
                                                    ...fileTree,
                                                    [currentFile]: {
                                                        file: {
                                                            contents: updatedContent
                                                        }
                                                    }
                                                }
                                                setFileTree(ft)
                                                saveFileTree(ft)
                                            }}
                                            // dangerouslySetInnerHTML={{ __html: hljs.highlight('javascript', fileTree[currentFile].file?.contents)?.value }}
                                            // style={{
                                            //     whiteSpace: 'pre-wrap',
                                            //     paddingBottom: '25rem',
                                            //     counterSet: 'line-numbering',
                                            // }}
                                            dangerouslySetInnerHTML={{
                                                __html: fileTree[currentFile]?.file?.contents
                                                    ? hljs.highlight('javascript', fileTree[currentFile].file.contents)?.value || 'Loading...'
                                                    : 'No content available',
                                            }}
                                            
                                        />
                                    </pre>
                                </div>
                            )
                        }
                    </div>

                </div>

                {iframeUrl && webContainer &&
                    (<div className="flex min-w-96 flex-col h-full">
                        <div className="address-bar">
                            <input type="text"
                                onChange={(e) => setIframeUrl(e.target.value)}
                                value={iframeUrl} className="w-full p-2 px-4 bg-slate-200" />
                        </div>
                        <iframe src={iframeUrl} className="w-full h-full"></iframe>
                    </div>)
                }


            </section>






            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
                        <header className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl font-semibold'>Select User</h2>
                            <button onClick={() => setIsModalOpen(false)} className='p-2'>
                                <i className="ri-close-fill"></i>
                            </button>
                        </header>
                        <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
                            {users.map(user => (
                                <div key={user._id} className={`user cursor-pointer ${Array.from(selectedUserId).indexOf(user._id) != -1 ? 'bg-slate-300' : "hover:bg-slate-200"}  p-2 flex gap-2 items-center rounded-full`} onClick={() => handleUserClick(user._id)}>
                                    <div className='aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                                        <i className="ri-user-fill absolute"></i>
                                    </div>
                                    <h1 className='font-semibold text-lg'>{user.email}</h1>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addCollaborators}
                            className='absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-md'>
                            Add Collaborators
                        </button>
                    </div>
                </div>
            )}

        </main>
    )
}

export default Project