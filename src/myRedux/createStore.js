import { isPlainObject } from "is-plain-object"
import kindOf from 'kind-of'
import { store } from "../redux/store"
// 生成一个随机数
const randomString = () => Math.random().toString(36).substring(7).split('').join('.')

// 初始的action的Type类型 确保不会重复
const actionTypes = {
    INIT: `REDUX/INIT${randomString()}`,
    REPLACE: `REDUZ/REPLACE${randomString()}`
}
function createStore(reduce,preloadedState,enhancer){
    // 当前数据
    let currentState = preloadedState
    // 接受reducer
    let currentReducer = reduce
    // 防止多重dispatch情况下操作同一资源
    let isDispatching = false




    // 返回当前数据
    const getState = () => {
        // 如果正在操作数据，则跑出正在操作数据的错误
        if (isDispatching){
            throw new Error('还在 dispatching 呢，dispatch 不了啊')
        }
        return currentState
    }

    const dispatch = action => {
        // 判断action 是不是纯对象
        if (!isPlainObject(action)){
            throw new Error(`不是纯净的object,是一个类似${kindOf(action)}的东西`)
        }
        if (isDispatching){
            throw new Error('还在 dispatching 呢，dispatch 不了啊')
        }
        try {
            isDispatching = true
            currentState = currentReducer(currentState,action)
        }finally{
            isDispatching = false
        }
    }

    /**
     * 大多数只会在 Code Spliting 的时候才会用到
     * 比如： 
     * 打包有两个JS，第一个JS文件先加载了reducer，第二个加载了新的reducer，就可以用replaceReducer去完成合并
     */
    function replaceReducer(nextReducer){
        currentReducer = nextReducer
        dispatch({  type: actionTypes.REPLACE })
        return store
    }

    // 不管外面在执行createStore的时候有没有传递actionType,都总是会执行的这个Init来执行数据的初始化
    dispatch({
        type: actionTypes.INIT
    })

    return {
        getState,
        dispatch,
        replaceReducer
    }
}

export default createStore