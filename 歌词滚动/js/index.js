console.log(lrc)
const lrcData = formatLrc(lrc)
const audio = document.querySelector('audio')
const container = document.querySelector('.container')
const ul = document.querySelector('.lrc-list')
const containerHeight = container.clientHeight

function formatLrc(data) {
    const lrcs = []
    data.split('\n').forEach(item => {
        lrcs.push({
            time: formatTime(item),
            lrc: item.split(']')[1]
        })
    })
    return lrcs
}

function formatTime(str) {
    const res = str.split(']')[0].substring(1)
    return res.split(':')[0] * 60 + res.split(':')[1] * 1
}

function monitorAudio() {
    const currentAudioTime = audio.currentTime
    const index =
        lrcData.findIndex(item => {
            return item.time > currentAudioTime
        }) - 1
    return index < 0 ? lrcData.length - 1 : index
}

function createLrcElement() {
    const frag = document.createDocumentFragment()
    lrcData.forEach(item => {
        const li = document.createElement('li')
        li.innerText = item.lrc
        frag.appendChild(li)
    })
    ul.appendChild(frag)
}
createLrcElement()

const liHeight = ul.children[0].clientHeight
const maxUpLength = lrcData.length * liHeight - containerHeight

function setUpLength() {
    const index = monitorAudio()
    let upLength = liHeight * index + liHeight / 2 - containerHeight / 2
    if (upLength < 0) {
        upLength = 0
    }
    if (upLength > maxUpLength) {
        upLength = maxUpLength
    }
    ul.style.transform = `translateY(-${upLength}px)`
    const lis = [...ul.children]
    lis.forEach(item => {
        item.classList.remove('active')
    })
    const li = ul.children[index]
    if (li) {
        li.classList.add('active')
    }
}

audio.addEventListener('timeupdate', function () {
    setUpLength()
})