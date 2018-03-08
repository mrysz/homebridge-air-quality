# Homebridge-air-quality

**[Homebridge](https://github.com/nfarina/homebridge) plugin to show informations about air quality, temperature and humidity, provided by [Airly](https://airly.eu/en/).**

Plugin inspired by [homenridge-airly](https://github.com/beniaminrychter/homebridge-airly).

## Instalation

[![NPM](https://nodei.co/npm/homebridge-air-quality.png)](https://nodei.co/npm/homebridge-air-quality/)

1. Install required package: `npm install -g homebridge-air-quality`.
1. Create new account in Airly.eu <https://developer.airly.eu/register> and get your individual **API Key**.
1. Find your coordinates (latitude and longitude). You should be in range of minimum one sensor.  
1. Update your configuration file, including **API Key**, coordinates, and select which sensors to show in HomeApp.

## Configuration
```json
"accessories": [
    {
         "accessory":"AirQuality",
         "apikey":"YOUR_API_KEY",
         "latitude":"YOUR_LATITUDE",
         "longitude":"YOUR_LONGITUDE",
         "pollingInterval":300,
         "showAirQualityIndex":true,
         "airQualityIndexName":"Air Quality",
         "showHumidity":true,
         "humidityName":"Humidity",
         "showTemperature":true,
         "temperatureName":"Temperature"
    }
]
```

## Settings
- `accessory` must be "AirQuality" (required)
- `apikey` API key from Airly Developers (required)
- `latitude` your latitude e.g. `"52.333658"` (required)
- `longitude` your longitude e.g. `"20.886986"` (required)
- `pollingInterval` how often fetch new data from Airly, in seconds (optional, default to `300`)
- `showAirQualityIndex` __show__ or __hide__ air quality sensor (optional, default to `false`)
- `airQualityIndexName` name of air quality sensor (optional, default to `"Air Quality"`)
- `showHumidity` __show__ or __hide__ humidity sensor (optional, default to `false`)
- `humidityName` name of humidity sensor (optional, default to `"Humidity"`)
- `showTemperature` __show__ or __hide__ temperature sensor (optional, default to `false`)
- `temperatureName` name of temperature sensor (optional, default to `"Temperature"`)

## Minimal configuration

Minimal configuration consists only 4 lines, but nothing will be shown in HomeApp. You should set `true` to at least one option witch begins with `show...`.

```json
"accessories": [
    {
         "accessory":"AirQuality",
         "apikey":"YOUR_API_KEY",
         "latitude":"YOUR_LATITUDE",
         "longitude":"YOUR_LONGITUDE",
    }
]
```
