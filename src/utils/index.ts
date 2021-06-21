import axios, {CancelTokenSource, AxiosResponse, AxiosRequestConfig} from 'axios';
import Storage from "./storage-helper";
interface AllowAnyKey {
    [key: string]: any,
}
// url黑名单
const blacklist:Array<string> = ['http://baidu.com'];
// 需要过滤的字段
const filterAttrArr:Array<string> = ['name','age'];
// 封装的local Storage
const storage = new Storage();
// 请求拦截器
axios.interceptors.request.use(function(config:AxiosRequestConfig):AxiosRequestConfig |Promise<AxiosRequestConfig>{
    /**
     * 为每一次请求生成一个cancleToken
     */
    // 用来取消请求的    
    const source = axios.CancelToken.source();
    //  在请求的配置中配置cancelToken，那么这个请求就有了可以取消请求的功能
    config.cancelToken = source.token;
    // 从local Storage取得响应url的数据
    const data = storage.get(config.url);
    blacklist.forEach(url=>{
        // 黑名单直接发请求,白名单的URL需要做一层缓存验证
        if(config.url !== url)
        {
            // 白名单命中缓存
            if(data && (Date.now() <= data.expires))
            {
                console.log('命中缓存');
                /**
                * 将缓存数据通过cancle方法回传给请求方法
                */
                source.cancel(JSON.stringify({
                    data: data.data,
                }));
            }
        }
    })
    return config;
})
// 响应拦截器  
axios.interceptors.response.use(function(res:AxiosResponse<any>):AxiosResponse<any> | Promise<AxiosResponse<any>>{ 
    const url=res.config.url;    
    // 对白名单url的特定字段进行缓存
    blacklist.forEach(item=>{
        if(item == url)
        {
            // 黑名单url的结果直接返回
            return res;
        }
        else
        {
            console.log(res.data);
            
            storage.set(url,{
                data:filterData(res.data,filterAttrArr),
                expires:Date.now()+1000 * 60 * 3
            });

        }
    })
    return res.data.data
})
 function filterData(data:object,filterAttrArr:Array<string>):AllowAnyKey
{
    let obj:AllowAnyKey = data;
    let cache:AllowAnyKey={};
    filterAttrArr.forEach(item=>{
        cache[item] = obj[item];
    })
    return cache;
}
// export function filterAndCacheData(axiosObj:object,filterAttrArr:Array<string>)
// {
//     axios(axiosObj)
//     .then(res=>{
//         let obj:AllowAnyKey = res.data;
//         let cache:AllowAnyKey={};
//         filterAttrArr.forEach(item=>{
//             cache[item] = obj[item];
//         })
//         storage.set(axiosObj['url'],JSON.stringify(cache))
//     });

// }
// filterAndCacheData(axiosObj,['name','age']);
function getCacheData(url:string)
{
    return localStorage.getItem(url);
}
function deleteCacheData(url:string)
{
    localStorage.removeItem(url);
}
