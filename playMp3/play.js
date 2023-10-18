export function succ(params) {
    const innerAudioContext = uni.createInnerAudioContext();
    innerAudioContext.autoplay = true;
    innerAudioContext.src = `/static/mp3/succ.mp3`;
    innerAudioContext.onPlay(() => { });
}
export function fail(params) {
    const innerAudioContext = uni.createInnerAudioContext();
    innerAudioContext.autoplay = true;
    innerAudioContext.src = `/static/mp3/fail.mp3`;
    innerAudioContext.onPlay(() => { });
}
