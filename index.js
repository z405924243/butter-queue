// 任务队列
// 此处 用于弹窗管理 后续可以跟 轮询队列合并，考虑更通用的封装

function QueueClass() {
    this.queue = [];
    // this.queueProxy = this.setProxy(this.queue)
}

// 创建一个proxy来管理消息，响应队列变化
// QueueClass.prototype.setProxy = function (obj) {
//     return new Proxy(obj, {
//         get(obj, prop, value) {

//         }
//     });
// }

QueueClass.prototype.pushTask = function (task) {
    if (task) {
        this.queue.push(task);
    }
};

QueueClass.prototype.clear = function () {
    this.queue = [];
};

// -----------------------------------------------

// 实例化两个队列：
const examQueue = new QueueClass();
const msgQueue = new QueueClass();

let doingFlag = false;
let stopExc = false;

// 执行任务
async function excTask() {
    if ((!examQueue.queue.length && !msgQueue.queue.length) || doingFlag) {
        return;
    }
    const useQueue = msgQueue.queue.length ? msgQueue.queue : examQueue.queue;

    doingFlag = true;
    const task = useQueue.shift();

    if (task.fn) {
        try {
            await task.fn();
        } catch (e) {
            console.error(e);
        }
        doingFlag = false;
    } else {
        doingFlag = false;
        throw new Error('请验证任务函数是否正确');
    }

    if (stopExc) {
        stopExc = false;
        return Promise.reject('停止执行');
    }
    await excTask();
    return Promise.resolve('执行完成');
}

// 停止任务
function pause() {
    stopExc = true;
}

export default {
    examQueue,
    msgQueue,
    excTask,
    pause
};