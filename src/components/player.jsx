import { React, useEffect, useRef, useState } from 'react'
import '../App.css'
import Reverb from './reverb'
import Filter from './filter'
import Visualizer from './visualizer'
import dayjs from 'dayjs'
import {musicUrlArr} from '../App'

export default function Player({context, audioBuffer, impulseBuffer, fxObj}){
    const [value, setValue] = useState(100);
    const [newBuffer, setNewBuffer] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [maxM, setMaxM] = useState(null);
    const [nowM, setNowM] = useState(null);
    const [select, setSelect] = useState(0);

    const inputRef = useRef();
    const rafRef = useRef();

    // console.log(fxObj)
    // console.log(audioBuffer)

    function play(index = fxObj.currIndex){

        const buffer = audioBuffer[index];
        fxObj.currSource = context.createBufferSource();
        fxObj.currSource.buffer = buffer;
            
        // 크로스페이드기능 만들려면 여기에다 나중에 추가

        fxObj.currSource.start(index, fxObj.offsetTime);
        
        fxObj.startTime = context.currentTime;

        // console.log(fxObj.offsetTime)

        fxObj.currSource.onended = () => {
            let nextIndex = fxObj.currIndex + 1;
            if(nextIndex === audioBuffer.length) nextIndex = 0;
            play(nextIndex);
            fxObj.currIndex = nextIndex;
            setSelect(nextIndex);
            fxObj.offsetTime = 0;
        };

        // fxObj.isPlaying = true;
        // fxObj.currSource = source;
        fxObj.currBuffer = buffer;

        setNewBuffer(buffer);
        const max = dayjs(buffer.duration * 1000).format("mm:ss");
        setMaxM(max);
    };

    function pause(){
        if(fxObj.currSource !== null){
            const currentTime = context.currentTime - fxObj.startTime + fxObj.offsetTime;
            fxObj.offsetTime = currentTime;

            // fxObj.isPlaying = false;
            fxObj.currSource.onended = null;
            fxObj.currSource.stop();
            // fxObj.currSource = null;
        }
    };

    function toggle(){
        if(playing){
            fxObj.isPlaying = false;
            setPlaying(false);
            pause();
        }else{
            fxObj.isPlaying = true;
            setPlaying(true);
            play();
        }
    };

    function stop(){
        if(fxObj.currSource !== null){
            fxObj.puaseTime = 0;
            fxObj.offsetTime = 0;
            fxObj.startTime = 0;
            fxObj.currSource.onended = null;
            fxObj.currSource.stop();
            fxObj.currSource = null;
            fxObj.isPlaying = false;
            setPlaying(false);
        }
    };

    function changeVolume(element){
        // const fraction = parseInt(element.value) / parseInt(element.max);
        // fxObj.volControlGainNode.gain.value = fraction * fraction; // min 0 max 100
        fxObj.volControlGainNode.gain.value = Number(element.value);
    };

    const handlePlayClick = () => {
        toggle();
    };

    const handleStopClick = () => {
        stop();
        cancelAnimationFrame(rafRef.current);
        setProgress(0);
    };

    const handleVolChange = (e) => {
        if(fxObj.currSource !== null){
            setValue(e.currentTarget.value);
            changeVolume(e.currentTarget);
        }
    };

    const handleListClick = (e) => {
        const index = Number(e.target.dataset.num)
        if(fxObj.currIndex !== index){
            console.log('다른거 클릭했다')
            if(playing){

                console.log('재생중이었다')

                // fxObj.currSource.stop();
                // fxObj.offsetTime = 0;
                // fxObj.currIndex = index;
                // play(index);
                // setProgress(0);
                // setSelect(index);
                
                stop();
                setSelect(index);
            }
            console.log('재생중아니었다')
            fxObj.offsetTime = 0;
            fxObj.currIndex = index;
            // play(index);
            // setProgress(0);
            // setSelect(index);
            fxObj.isPlaying = true;
            setPlaying(true);
            play(index);
            setSelect(index);
        }else{
            console.log('같은거 클릭했다')
        }
    }

    // progress 업데이트 함수
    const updateProgress = () => {
        if (context && fxObj.currSource && fxObj.isPlaying) {
            const currentTime = context.currentTime - fxObj.startTime + fxObj.offsetTime;
            const duration = fxObj.currSource.buffer.duration;
            const progress = (currentTime / duration) * 100;
            const now = dayjs(currentTime * 1000).format("mm:ss")
            setProgress(progress);
            setNowM(now);
        }

        rafRef.current = requestAnimationFrame(updateProgress);
    };

    useEffect(()=>{
        if(audioBuffer.length > 0){
            const buffer = audioBuffer[0];
            const source = context.createBufferSource();
    
            source.buffer = buffer;
    
            fxObj.currSource = source;
            fxObj.currBuffer = buffer;

            const max = dayjs(buffer.duration * 1000).format("mm:ss");
            const now = dayjs(0).format("mm:ss")
            setMaxM(max);
            setNowM(now);

            setNewBuffer(buffer);

            const volControlGainNode = context.createGain();

            source.connect(volControlGainNode);//
            volControlGainNode.connect(context.destination);

            fxObj.volControlGainNode = volControlGainNode;

            // setFull(source.buffer.duration);//나중에 필요할 것 같아서 남겨둠 
        }
    },[audioBuffer])

    useEffect(()=>{
        updateProgress();
    },[context, fxObj, context, context.currentTime, fxObj.currSource, fxObj.isPlaying, fxObj.startTime, fxObj.offsetTime])

    return (
        <>
        <div className='webapbox'>
            <p style={{fontSize: '1.2rem'}}>player</p>
            <div className='webapprogress'>
                <progress id='webapprogbar' className='webapprogressbar' value={progress} max={100}></progress>
            </div>
            <div className='webapplaybtn' style={{cursor : 'pointer'}}>
                {playing ?
                    <span className="material-icons-outlined" onClick={handlePlayClick}>pause</span> :
                    <span className="material-icons-outlined" onClick={handlePlayClick}>play_arrow</span>
                }
                <span className="material-icons-outlined" onClick={handleStopClick}>stop</span>
                <span className="material-icons-outlined">volume_up</span>
                <input
                    ref={inputRef}
                    type='range'
                    min={-1.5}
                    max={0.5}
                    step={0.01}
                    value={value}
                    onChange={handleVolChange}
                />
                <p style={{fontSize:'13px'}}>{nowM} / {maxM}</p>
            </div>
            <div className="webaplist" style={{cursor : 'pointer'}}>
                {musicUrlArr.map((e, i)=>(
                    <p key={i} data-num={i} style={{color : select === i ? '#000' : '#fff'}} onClick={handleListClick}>{e.name}</p>
                ))}
            </div>
        </div>
        <Reverb context={context} audioBuffer={audioBuffer} impulseBuffer={impulseBuffer} fxObj={fxObj} currBuffer={newBuffer}></Reverb>
        <Filter context={context} audioBuffer={audioBuffer} fxObj={fxObj} currBuffer={newBuffer}></Filter>
        <Visualizer context={context} audioBuffer={audioBuffer} fxObj={fxObj} currBuffer={newBuffer}></Visualizer>
        </>
    )
}