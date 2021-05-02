import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import CityTable from './components/Table';
import CityChart from './components/Chart';
import useLocalStorage from 'hooks/persistentState';
import { pollutionDataSource } from './requests';
import styles from './home.module.less';
import { AppBar, Button, Grid, Toolbar, Typography } from '@material-ui/core';

const HomeView = () => {
  const [pollutionObj, setPollutionObj] = useLocalStorage('pollutionRecord', {});
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    pollutionDataSource.onopen = () => {
      console.log('connected')
      }

      pollutionDataSource.onmessage = event => {
        const dataArray = JSON.parse(event.data);
        const messageReceivedAt = Date.now();
        setPollutionObj((prevPollution) => {
          const pollutionMap = _.cloneDeep(prevPollution);
          const dataObj = _.reduce(dataArray, (acc, cityObj) =>{
            
            const cityName = cityObj.city;
  
            if(!cityName){ return acc; }
  
            const record = {
              aqi: Math.round(cityObj.aqi * 100) / 100,
              receivedAt: messageReceivedAt
            }
  
            if(acc[cityName]){
              acc[cityName].push(record);
              if(acc[cityName].length > 20) { acc[cityName].shift(); }
            }else {
              console.log('Creating new record : ', cityName);
              acc[cityName] = [record];
            }
  
            return acc;
          }, pollutionMap);
          if(dataObj.messageReceivedAt && Array.isArray(dataObj.messageReceivedAt)){
            dataObj.messageReceivedAt.push(messageReceivedAt)
            if(dataObj.messageReceivedAt.length > 50) { dataObj.messageReceivedAt.shift(); }
          }else {
            dataObj.messageReceivedAt = [messageReceivedAt];
          }
          console.log(dataObj);
          return dataObj;
        })
       
      }

      pollutionDataSource.onclose = () => {
        console.log('disconnected')
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleReset = () => {
    setPollutionObj({});
  }

  return (
    <div className={styles.homeContainer}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={styles.title}>
            Air Quality Report
          </Typography>
          <Button color="inherit" className={styles.rightButton} onClick={handleReset}>Reset</Button>
        </Toolbar>
      </AppBar>
      <Grid container spacing={3} className={styles.container}>
        <Grid item xs={4}>
          <CityTable 
            pollutionData={pollutionObj} 
            selected={selected}
            setSelected={setSelected}
          />
        </Grid>
        <Grid item xs={8}>
          <CityChart 
            pollutionData={pollutionObj} 
            selected={selected}
          />
        </Grid>
      </Grid>        
    </div>
  );
};

export default HomeView;

HomeView.propTypes = {};
