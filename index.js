"use strict";

const request = require('request');
const logger = require('./lib/logger');
let Service, Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-air-quality", "AirQuality", AirQuality);
};

/**
 * Air Accessory
 */
function AirQuality(log, config) {
    logger.handler = log;

    this.pollingInterval = config.pollingInterval || 300;

    this.apikey = config.apikey;

    this.showAirQualityIndex = config.showAirQualityIndex || false;
    this.airQualityIndexName = config.airQualityIndexName || 'Air Quality';

    this.showHumidity = config.showHumidity || false;
    this.humidityName = config.humidityName || 'Humidity';

    this.showTemperature = config.showTemperature || false;
    this.temperatureName = config.temperatureName || 'Temperature';

    this.latitude = config.latitude;
    this.longitude = config.longitude;

    if (!this.latitude) {
        throw new Error("No 'latitude' config value");
    }
    if (!this.longitude) {
        throw new Error("No 'longitude' config value");
    }

    this.lastUpdate = 0;
    this.sensors = {};
    this.data = undefined;
}

AirQuality.prototype = {

    // wrapper for updateData method (new data/cache)
    setData: function (params) {
        if (this.lastUpdate === 0 || this.lastUpdate + this.pollingInterval < (new Date().getTime() / 1000) || this.data === undefined) {
            this.fetchData(params);
            return;
        }

        this.updateData(params);
    },

    // update sensors data
    updateData: function (params) {
        let self = this;

        if (params['key'] in self.data) {
            let widget = self.sensors[params['key']];

            widget.setCharacteristic(Characteristic.StatusFault, 0);
            let value = params.formatter(this.data[params['key']]);
            logger.log('info', params['key'] + ' = ' + value);
            params.callback(null, value);
            if ('characteristics' in params) {
                params['characteristics'].forEach(function (characteristic) {
                    let value = characteristic.formatter(self.data[characteristic.key]);
                    logger.log('info', characteristic.key + ' = ' + value);
                    widget.setCharacteristic(characteristic.characteristic, value);
                });
            }
        } else {
            this.sensors[params['key']].setCharacteristic(Characteristic.StatusFault, 1);
            logger.log('info', params['key'] + ' = no value');
            params.callback(null);
        }
    },

    // fetch new data from Airly
    fetchData: function (params) {
        let self = this;

        request({
            url: 'https://airapi.airly.eu/v1/mapPoint/measurements?latitude=' + this.latitude + '&longitude=' + this.longitude,
            json: true,
            headers: {
                'apikey': self.apikey
            }
        }, function (err, response, data) {
            if (!err && response.statusCode === 200) {
                self.data = data.currentMeasurements;
                self.lastUpdate = new Date().getTime() / 1000;
                self.updateData(params);
            } else {
                logger.log('error', "fetchData error");
            }
            self.fetchInProgress = false;
        });
    },

    updateAirQualityIndex: function (callback) {
        this.setData({
            'callback': callback,
            'key': 'airQualityIndex',
            'characteristics': [
                {
                    'key': 'pm25',
                    'characteristic': Characteristic.PM2_5Density,
                    'formatter': value => parseFloat(value)
                },
                {
                    'key': 'pm10',
                    'characteristic': Characteristic.PM10Density,
                    'formatter': value => parseFloat(value)
                }
            ],
            'formatter': value => Math.min(Math.ceil(parseFloat(value) / 25), 5)
        });
    },

    updateTemperature: function (callback) {
        this.setData({
            'callback': callback,
            'key': 'temperature',
            'formatter': value => Math.round(parseFloat(value))
        });
    },

    updateHumidity: function (callback) {
        this.setData({
            'callback': callback,
            'key': 'humidity',
            'formatter': value => Math.round(parseFloat(value))
        });
    },

    identify: callback => callback(),

    getServices: function () {
        let informationService = new Service.AccessoryInformation();
        informationService
            .setCharacteristic(Characteristic.Manufacturer, "Air Quality")
            .setCharacteristic(Characteristic.Model, "API")
            .setCharacteristic(Characteristic.SerialNumber, "0000-0000-0000");
        this.sensors['information'] = informationService;

        if (this.showAirQualityIndex) {
            let airQualityIndexSensorService = new Service.AirQualitySensor(this.airQualityIndexName);
            airQualityIndexSensorService.getCharacteristic(Characteristic.AirQuality).on('get', this.updateAirQualityIndex.bind(this));
            this.sensors['airQualityIndex'] = airQualityIndexSensorService;
        }

        if (this.showTemperature) {
            let temperatureSensorService = new Service.TemperatureSensor(this.temperatureName);
            temperatureSensorService.getCharacteristic(Characteristic.CurrentTemperature).on('get', this.updateTemperature.bind(this));
            this.sensors['temperature'] = temperatureSensorService;
        }

        if (this.showHumidity) {
            let humiditySensorService = new Service.HumiditySensor(this.humidityName);
            humiditySensorService.getCharacteristic(Characteristic.CurrentRelativeHumidity).on('get', this.updateHumidity.bind(this));
            this.sensors['humidity'] = humiditySensorService;
        }

        return Object.values(this.sensors);
    }
};
