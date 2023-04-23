import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import ToggleButton from '../utilities/ToggleButton'
import ForecastCardExtended from './forecast-card-extended/ForecastCardExtended'
import ForecastCardMinified from './forecast-card-minified/ForecastCardMinified'
import stars from '../../assets/etoile-32px.png'
import localisation from '../../assets/marqueur-32px.png'
import './ForecastCardBackground.css'

const ForecastCardBackground = ({currentSpot}) => {

    // Contient les donnés API
    const [tide, setTide] = useState([])
    const [surfDataWind,  setSurfDataWind] = useState([])
    const [surfDataHoule, setSurfDataHoule] =useState([])
    const [onLoad, setOnLoad] = useState(true)

    useEffect(() => {
      // API TIDE récupère la marée haute et basse sur 10jours mais attention car que 10 fetch par jour donc delay de 3h appliqué
      const delayTide = setTimeout(() => {
        axios
        .get(
          `https://api.stormglass.io/v2/tide/extremes/point?lat=${currentSpot.latitude}&lng=${currentSpot.longitude}&start=2023-04-19&end=2023-04-29`,{
          headers: {
              'Authorization': 'ed2bcc96-ddf7-11ed-92e6-0242ac130002-ed2bcd72-ddf7-11ed-92e6-0242ac130002'
            }}
        )
        .then((res) => res.data)
        .then((data) => {
          setTide(data);
        });

      }, 3*60*60*1000); 

    },[])

    useEffect(() => {
      // API VENT( Orientation vent, Puissance en hourly et Daily sur 7 jours)
      axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${currentSpot.latitude}&longitude=${currentSpot.longitude}&hourly=windspeed_10m,winddirection_10m&daily=windspeed_10m_max,winddirection_10m_dominant&timezone=Europe%2FBerlin`)
        .then((req) => req.data)
        .then((data) => {
          setSurfDataWind(data);
          setOnLoad(false)
        });
      
        // API HOULE (Hourly : Wave height et wave period / Daily : Wave height Max et Wave direction dominant)
      axios.get(`https://marine-api.open-meteo.com/v1/marine?latitude=${currentSpot.latitude}&longitude=${currentSpot.longitude}&hourly=wave_height,wave_period&daily=wave_height_max,wave_direction_dominant&timezone=Europe%2FBerlin`)
        .then((req) => req.data)
        .then((data) => {
          setSurfDataHoule(data);
        });
      

    },[])

    const today = new Date();  // Créer un objet Date avec la date et l'heure actuelles
    const options = { weekday: 'long', day: '2-digit' }; // affiche le jours en long et la date en chiffres
    const oneDay = 24 * 60 * 60 * 1000; // durée de 24h
    const dayForecast = [] // array qui receveras les dates

    // boucle qui génère automatiquement les 7 prochains jours
    for(let i = 0; i < 7; i++){
        dayForecast.push((new Date(today.getTime() + (i * oneDay))).toLocaleDateString('fr-FR', options))
    }
   

    
  return (
    <div className='background-forcast'>
        <div className='header'>
            <div>
              <div className='flexSpotName'>
                <p className='spotName'>
                  <img className='spotNameLocalisation' src={localisation} />
                    {currentSpot.name} 
                  </p>
                  <img className='spotNameStars' src={stars} />
                </div>
              <a className='spotNameWebcam' href={currentSpot.webcam} target='_blank'>
                Acceder à la webcam
              </a>
            </div>
            <div>
                <ToggleButton />
            </div>
        </div>
        <div className='bodyForecastCard'>
            {
              dayForecast.map((el,index) => (
                <div className='daily-forecast'>
                  <p className='dayDate'>{el}</p>
                  <ForecastCardMinified 
                    key={`minified ${index}`}
                    surfDataWind ={surfDataWind}
                    number = {index}
                    onLoad ={onLoad}
                  />
                  <p className='dayDate'>{el}</p>
                  <ForecastCardExtended 
                    key={`extended ${index}`}
                    surfDataWind ={surfDataWind}
                    onLoad ={onLoad}
                    index={index}
                  />
                </div>
              ))
            }
        </div>
    </div>
  )
}

export default ForecastCardBackground