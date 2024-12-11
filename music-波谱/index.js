function $querySelector(selector) {
    return document.querySelector(selector);
}

const audioEle = $querySelector('#audio');
const cvsBox = $querySelector('.canvas');
const cvs = $querySelector('canvas');
const ctx = cvs.getContext('2d');

// 初始化 canvas 尺寸
function initCvs() {
    const {width, height} = cvsBox.getBoundingClientRect();
    cvs.width = width;
    cvs.height = height;
}
initCvs();

let isInit = false;
let dataArray;
let analyser;
const fftSize = 512;
audioEle.onplay = function () {
    // 初始化 只需要一次
    if (isInit) {
        return;
    }
    // 初始化
    // 创建音频上下文
    const audioCtx = new AudioContext();
    // 创建音频源节点 (音频源) => 可以对其操作(音色, 混响等)的节点
    const source = audioCtx.createMediaElementSource(audioEle);
    // 创建分析器节点, 分析音频波形
    analyser = audioCtx.createAnalyser();

    // A: 分析器进行设置
    // fftSize 设置窗口大小, 窗口越大, 分析越细腻: 这个值必须是2^n 次幂
    analyser.fftSize = fftSize;
    // 频谱均衡器精度
    analyser.smoothingTimeConstant = 0.8;
    // 创建数组, 用于接收分析器节点的分析数据, 数组是类型化数组,存储字节
    // 长度是频域图(柱状图)横坐标范围, 这个完整图是对称图, 因此长度只保存一半即可, 取前半部分
    // const dataArray = new Uint8Array(fftSize / 2); // 8位字节 (长度)
    // 通过分析器里面一个属性: analyser.frequencyBinCount => fftSize / 2
    dataArray = new Uint8Array(analyser.frequencyBinCount); // 开始是空数组
    // 分析器 和 数据数组要提出去, 因为后需要分析

    // 音频源数据输出到分析器节点, 过程叫连接
    source.connect(analyser);
    // 分析器节点连接到输出设备
    analyser.connect(audioCtx.destination);
    // 上面处理后节点就完成了, 下来分析器分析波形显示到canvas
    // 时域图 => 频域图: 频谱分析|FFT快速傅里叶变换
    // 需要对分析器进行设置: 看A
  

    isInit = true;
}

// 把分析出的波形绘制到canvas 上, 不断的绘制
function draw() {
    requestAnimationFrame(draw);
    // 清空画布
    const {width, height} = cvs;
    ctx.clearRect(0, 0, width, height);

    // 分析器是否进行了初始化
    if (!isInit) {
        return;
    }
    // 分析器节点分析出数据到数组
    // 让分析器节点分析音频源给你的一小段数据, 把分析出来的数据放到dataArray数组里面去
    analyser.getByteFrequencyData(dataArray);
    // console.log(dataArray);
    // 将数据绘制到界面 (柱状图为例, 可以是任意图)
    const len = dataArray.length / 2; // /2(2.5, 3 等等) 是因为音频很多低音我们不识别, 占比非常大
    // / 2 需要画出另外一半音频, 因此每条需要减半
    const barWidth = width / len / 2; // 每一个数据条的宽度
    // ctx.fillStyle = '#78C5F7'; // 设置统一颜色
    ctx.fillStyle = '#FF0000';
    for (let i = 0; i < len; i++) {
        const data = dataArray[i]; // 8位整数 < 256
        const barHeight = data / fftSize * 1.5 * height; // 高度条比例 / 画布高度
        // 横坐标 & 纵坐标
        const x = i * barWidth + width / 2; // 需要加上画布宽度一半, 从画布中间画, 便于我们画对称图
        const x2 = width / 2 - (i + 1) * barWidth;
        const y = height - barHeight;
        // barWidth - 2 不会太密集
        ctx.fillRect(x, y, barWidth - 2, barHeight);
        // 在画左半边
        ctx.fillRect(x2, y, barWidth - 2, barHeight);
    }
}
draw();