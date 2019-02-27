import {
  URL_ENTRY,
  API_KEY_ENTRY,
  FETCH_METRICS_SUCCESS,
  FETCH_METRICS_FAIL,
  FETCH_METRICS
} from "./actionTypes";
import { Actions } from "react-native-router-flux";
import * as firebase from "firebase";



export const apiEntry = text => {
  return {
    type: API_KEY_ENTRY,
    payload: text
  };
};

export const urlEntry = text => {
  return {
    type: URL_ENTRY,
    payload: text
  };
};



export const fetchMetrics = ({api, url}) => {
  return dispatch => {
    dispatch({ type: FETCH_METRICS });
    //let grafurl = 'http://35.232.120.147/api/datasources/proxy/1/api/v1/query_range?';
    //let apiKey = 'eyJrIjoiYmFnUmh5STVRM0xZTnljcDB4aGJ5akpsanRsa0M3RWMiLCJuIjoiYWRnZW5rZXkiLCJpZCI6MX0=';
    let apiKey = api;
    let grafurl = `http://${url}/api/datasources/proxy/1/api/v1/query_range?`;
    let startTime = Math.floor(Date.now() / 1000 - 3600 * 6);
    let endTime = Math.floor(Date.now() / 1000);
    let step = 30;
    let queryCpu =
    'sum(rate(node_cpu{mode!="idle",mode!="iowait",mode!~"^(?:guest.*)$"}[5m])) BY (instance)';
    let urlValCpu = `${grafurl}query=${queryCpu}&start=${startTime}&end=${endTime}&step=${step}`;
    let queryMem = "1 - sum(node_memory_MemAvailable) by (node) / sum(node_memory_MemTotal) by (node)";
    let urlValMem = `${grafurl}query=${queryMem}&start=${startTime}&end=${endTime}&step=${step}`;
    //let queryNetSat ='sum(rate(node_network_receive_bytes[5m])) by (node) + sum(rate(node_network_transmit_bytes[5m])) by (node)';
    let queryNetSat ='sum(rate(node_network_receive_bytes[5m])) by (node)';
    let urlValNetSat = `${grafurl}query=${queryNetSat}&start=${startTime}&end=${endTime}&step=${step}`;
    //let urlNetSatOne = encodeURI(urlValNetSat);
    let queryNetSatTrans = 'sum(rate(node_network_transmit_bytes[5m])) by (node)';
    let urlValNetSatTrans = `${grafurl}query=${queryNetSatTrans}&start=${startTime}&end=${endTime}&step=${step}`;
    let querySat =
    'sum(node_load1) by (node) / count(node_cpu{mode="system"}) by (node) * 100';
  let urlValSat = `${grafurl}query=${querySat}&start=${startTime}&end=${endTime}&step=${step}`;
    let dataFetch = [
      fetch(urlValCpu,{
  method: 'GET',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization : `Bearer ${apiKey}`,
  },
})
        .then(data => {
          console.log('return from cpu fetch call ',data);
          return data.json()})
        .then(json => {
          console.log("cpu");
          let dataArray = [];
          let lastItem;
          json.data.result[0].values.forEach((val, i) => {
            lastItem = val[1];
            val = { x: val[0], y: Number(val[1] * 100000) };
            dataArray.push(val);
          });
          console.log(lastItem);
          return dataArray;
        })
        .catch(err => console.log(err)),

      //fetch("http://localhost:3477/memoryutilization")
      fetch(urlValMem,{
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization : `Bearer ${apiKey}`,
        },
      })
        .then(data => data.json())
        .then(json => {
          let dataArray = [];
          json.data.result[0].values.forEach(val => {
            val = { x: val[0], y: Number(val[1]) };
            dataArray.push(val);
          });
          return dataArray;
        })
        .catch(err => console.log(err)),
      //fetch("http://localhost:3477/networktraffic")
      fetch(urlValNetSat,{
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization : `Bearer ${apiKey}`,
        },
      })
        .then(data => data.json())
        .then(json => {
          let dataArray = [];
          json.data.result[0].values.forEach(val => {
            val = { x: val[0], y: Number(val[1]) };
            dataArray.push(val);
          });
          return dataArray;
        })
        .catch(err => console.log(err)),
      //fetch("http://localhost:3477/saturation")
      fetch(urlValSat,{
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization : `Bearer ${apiKey}`,
        },
      })
        .then(data => data.json())
        .then(json => {
          let dataArray = [];
          json.data.result[0].values.forEach(val => {
            val = { x: val[0], y: Number(val[1]) };
            dataArray.push(val);
          });
          return dataArray;
        })
        .catch(err => console.log(err)),
        fetch(urlValNetSatTrans,{
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization : `Bearer ${apiKey}`,
          },
        })
          .then(data => data.json())
          .then(json => {
            let dataArray = [];
            json.data.result[0].values.forEach(val => {
              val = { x: val[0], y: Number(val[1]) };
              dataArray.push(val);
            });
            return dataArray;
          })
          .catch(err => console.log(err))
    ];

    Promise.all(dataFetch)
      .then(data => {
        fetchMetricsSuccess(dispatch, data);
        Actions.main();
      })
      .catch(() => fetchMetricsFail(dispatch));
  };
};

const fetchMetricsFail = dispatch => {
  dispatch({ type: FETCH_METRICS_FAIL });
};
const fetchMetricsSuccess = (dispatch, data) => {
  dispatch({
    type: FETCH_METRICS_SUCCESS,
    payload: data
  });
};

