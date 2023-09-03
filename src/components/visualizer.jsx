import { React, useRef, useState, useEffect } from 'react'
import '../App.css'

export default function Visualizer({context, audioBuffer, fxObj, currBuffer}){
    const canvasRef = useRef();

    useEffect(()=>{
        // console.log(fxObj)
        if(fxObj.currSource !== null && fxObj.currSource !== undefined){

            let SMOOTHING = 0.8;
            let FFT_SIZE = 2048;
            const HEIGHT = 120; //360
            const WIDTH = 480; //640

            const analyser = context.createAnalyser();

            const freqs = new Uint8Array(analyser.frequencyBinCount);
            const times = new Uint8Array(analyser.frequencyBinCount);

            analyser.connect(context.destination);
            analyser.minDecibels = -140;
            analyser.maxDecibels = 0;

            if(fxObj.isPlaying){

                fxObj.startTime = context.currentTime;
                console.log('started at', fxObj.offsetTime);

                // Connect graph
                fxObj.currSource.connect(analyser);

                draw();
                
                function draw(){
                    const canvas = canvasRef.current;
                    const drawContext = canvas.getContext('2d');
                    drawContext.clearRect(0, 0, WIDTH, HEIGHT);

                    analyser.smoothingTimeConstant = SMOOTHING;
                    analyser.fftSize = FFT_SIZE;
        
                    // Get the frequency data from the currently playing music
                    analyser.getByteFrequencyData(freqs);
                    analyser.getByteTimeDomainData(times);
        
                    const width = Math.floor( 1 / freqs.length, 10);

                    canvas.width = WIDTH;
                    canvas.height = HEIGHT;
                    // Draw the frequency domain chart.
                    for (let i = 0; i < analyser.frequencyBinCount; i++) {
                        let value = freqs[i];
                        let percent = value / 256;
                        let height = HEIGHT * percent;
                        let offset = HEIGHT - height - 1;
                        let barWidth = WIDTH / analyser.frequencyBinCount;
                        let hue = i / analyser.frequencyBinCount * 360;
                        drawContext.fillStyle = 'white'; //'hsl(' + hue + ', 100%, 50%)'
                        drawContext.globalAlpha = '1.0';
                        drawContext.fillRect(i * barWidth, offset, 1, height); // i * barWidth, offset, barWidth, height
                    }
        
                    // Draw the time domain chart.
                    for (let i = 0; i < analyser.frequencyBinCount; i++) {
                        let value = times[i];
                        let percent = value / 256;
                        let height = HEIGHT * percent;
                        let offset = HEIGHT - height - 1;
                        let barWidth = WIDTH / analyser.frequencyBinCount;
                        drawContext.fillStyle = 'white';
                        drawContext.fillRect(i * barWidth, offset, 1, 2);
                    }

                    requestAnimationFrame(draw);
                };
            } else {
                console.log('paused at', fxObj.offsetTime);
            }
        }
    },[fxObj.currBuffer, fxObj.isPlaying])

    return (
        <div className='webapbox'>
            <p style={{fontSize: '1.2rem'}}>visualizer</p>
            <canvas className='webapcanvas' ref={canvasRef} ></canvas>
        </div>
    )
}