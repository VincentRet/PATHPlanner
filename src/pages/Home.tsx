import React, { useEffect, useState } from 'react';
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonText,
} from '@ionic/react';
import { trainSharp } from 'ionicons/icons';
import axios from 'axios';
import './Home.css';

const Home: React.FC = () => {
  const [station, setStation] = useState<string | null>(null);
  const [previousStation, setPreviousStation] = useState<string | null>(null);
  const [pathData, setPathData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const getPathData = async () => {

    window.speechSynthesis.cancel()

    if (!station) return;
    const setData: { target: any; projectedArrival: any; secondsToArrival: any; lineColor: any; }[] = [];

    setLoading(true);
    try {
      const { data } = await axios.get('https://getpathdata-v3fqdigh7q-uc.a.run.app')
      const results = data.results;
      results.forEach((stationObject: any) => {
        const consideredStation = stationObject.consideredStation;
        if (consideredStation === station) {
          const destinations = stationObject.destinations;
          destinations.forEach((destinationObject: any) => {
            const trains = destinationObject.messages
            trains.forEach((train: any) => {
              const trainObject = {
                "target": train.target,
                "projectedArrival": train.arrivalTimeMessage,
                "secondsToArrival": parseInt(train.secondsToArrival, 10),
                "lineColor": getArrivalColor(parseInt(train.secondsToArrival, 10))
              };
              setData.push(trainObject);
              // console.log(setData);
            });
          });
        }
      });
      setPathData(setData || []);
    } catch (error) {
      console.error('Error fetching PATH data:', error);
      setPathData([]);
    } finally {
      setLoading(false);
    }
  };

  const stations = [
    { label: 'Newark', value: 'NWK' },
    { label: 'Harrison', value: 'HAR' },
    { label: 'Journal Square', value: 'JSQ' },
    { label: 'Grove Street', value: 'GRV' },
    { label: 'Exchange Place', value: 'EXP' },
    { label: 'World Trade Center', value: 'WTC' },
    { label: 'Newport', value: 'NEW' },
    { label: 'Hoboken', value: 'HOB' },
    { label: 'Christopher Street', value: 'CHR' },
    { label: 'Ninth Street', value: '09S' },
    { label: 'Fourteenth Street', value: '14S' },
    { label: 'Twenty Third Street', value: '23S' },
    { label: 'Thirty Third Street', value: '33S' },
  ];

  const getLabelByValue = (value: any) => {
    const station = stations.find((station) => station.value === value);
    return station ? station.label : "Unknown";
  }

  const checkTrainArrival = (pathData: any) => {
    // console.log("In checkTrainArrival()...");
    pathData.forEach((train: any) => {
      if (train.secondsToArrival <= 300 && train.secondsToArrival > 0) {
        announceTrainArrival(train.target);
      }
    });
  };

  const announceTrainArrival = (target: string) => {
    // console.log("In announceTrainArrival()...");
    const message = `A train headed to ${getLabelByValue(target)} is arriving soon!`;
    const speech = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(speech);
    silentVoice();
  };

  function silentVoice() {
    const message = 'test';
    const speech = new SpeechSynthesisUtterance(message);
    speech.volume = 0;
    window.speechSynthesis.speak(speech);
  }

  useEffect(() => {
    // console.log("In useEffect()...");
    if (isChecked && pathData && pathData.length > 0) {
      checkTrainArrival(pathData);
    }

    const interval = setInterval(() => {
      if (isChecked && pathData && pathData.length > 0) {
        checkTrainArrival(pathData);
      }
    }, 60000); 

    return () => clearInterval(interval);
  }, [pathData, isChecked]);

  function getArrivalColor(secondsToArrival: any) {
    if (secondsToArrival <= 300) {
      return '#dc2f2f'; // Red
    } else if (secondsToArrival <= 600) {
      return '#ff894c'; // Orange
    } else if (secondsToArrival <= 1800) {
      return '#ffc93c'; // Yellow
    } else {
      return '#388e3c'; // Green
    }
  }



  const IncomingTrains: React.FC<{ pathData: any[], stations: any[] }> = React.memo(({ pathData}) => {
    return (
      <>
        <h1 className="title">Incoming Trains</h1>
        <IonList className="train-list">
          {pathData.map((train, index) => (
            <IonItem key={index} className="train-item">
              <div className="train-info">
                <div
                  style={{
                    backgroundColor: train.lineColor.startsWith('#') ? train.lineColor : `#${train.lineColor}`,
                    height: '1rem',
                    width: '3rem',
                    borderRadius: '.5rem',
                  }}
                />
                <h2 style={{ marginBottom: 0 }}>
                  To {getLabelByValue(train.target)}
                </h2>
                <h3>Projected Arrival: {train.projectedArrival}</h3>
              </div>
            </IonItem>
          ))}
        </IonList>
      </>
    );
  });



  return (
    <IonPage>


      <IonHeader>
        <div className='header-container'>
          <IonIcon icon={trainSharp} style={{ color: 'white' }} />
          <h1>PATH Planner</h1>
        </div>
      </IonHeader>

      

      <IonContent fullscreen>

      <div className='checkbox-container'>
          <IonCheckbox
            checked={isChecked}
            onIonChange={(e) => {
              setIsChecked(e.detail.checked)
              silentVoice();
            }}>       
            Notify me when a train is near
          </IonCheckbox>
        </div>
        
        <IonList className='drop-down-list'>
          <IonItem className='list-item'>
            <IonSelect
              className='select'
              label="Current Station"
              labelPlacement="stacked"
              fill="outline"
              okText="Select"
              cancelText="Cancel"
              onIonChange={(e) => {
                setStation(e.detail.value);
              }
              }
            >
              {stations.map((station) => (
                <IonSelectOption key={station.value} value={station.value}>
                  {station.label}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </IonList>

        <div className='button-container'>
          <IonButton
            expand="block"
            onClick={
              () => {
                getPathData();
                setPreviousStation(station);
              }
            }
            disabled={!station || loading}
          >
            {station && station === previousStation ? 'Refresh' : 'Get Train Times'}
          </IonButton>
        </div>

        {station ?

          (
            loading ?
              (
                <h1 className='temp-text'>Loading train times...</h1>
              )
              :
              station === previousStation && pathData && pathData.length > 0 ?
                (
                  <IncomingTrains pathData={pathData} stations={stations} />
                ) :
                (
                  pathData && station === previousStation && !loading && <h2 className='temp-text'>No upcoming trains. Check back in a few minutes.</h2> // Show this only if not loading
                )
          )

          :

          (
            <h2 className='temp-text'>Please select your current station.</h2>
          )
        }



        {/* <div className='checkbox-container'>
          <IonCheckbox
            checked={isChecked}
            onIonChange={(e) => {
              setIsChecked(e.detail.checked)
              silentVoice();
            }}>       
            Notify me when a train is near
          </IonCheckbox>
        </div> */}

      </IonContent>
    </IonPage>
  );
};

export default Home;
