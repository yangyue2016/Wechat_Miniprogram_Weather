const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

Page({
  data: {
    nowTemp: "",
    nowWeather: "",
    nowWeatherBG: "",
    hourlyWeather: [],
    todayDate:"",
    todayTemp:"",
    currentCity:"广州市",
    locationAuthType:UNPROMPTED
  },

  onPullDownRefresh(){
    this.getNow(()=>{
      wx.stopPullDownRefresh()
    })
  },

  onLoad() {
    // 实例化API核心类
    this.qqmapsdk = new QQMapWX({
      key: 'TZEBZ-QJVRW-JVPRQ-RJLTC-7FKTK-IPBTQ'
    })
    wx.getSetting({
      success: res=>{
        let auth = res.authSetting['scope.userLocation']
        this.setData({
          locationAuthType : auth? AUTHORIZED: 
          (auth === false)? UNAUTHORIZED:UNPROMPTED,
        })
        if (auth) {
          this.getCityAndWeather()
        }
        else {
          this.getNow()
        }
      }
    })
    this.getNow()
  },

  getNow(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: this.data.currentCity
      },
      success: res => {
        console.log(res)
        let result = res.data.result

        this.setNow(result)

        this.setHourlyWeather(result)

        this.setToday(result)

        complete: ()=>{
          callback && callback()
        }
      }
    })
  },

  setNow(result){
    let temp = result.now.temp
    let weather = result.now.weather
    console.log(temp, weather)
    this.setData({
      nowTemp: temp + '℃',
      nowWeather: weatherMap[weather],
      nowWeatherBG: '/images/' + weather + '-bg.png'
    })

    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },

  setHourlyWeather(result){
    let forecast = result.forecast
    let nowHour = new Date().getHours()
    let hourlyWeather = []
    for (let i = 0; i < 8; i += 1) {
      hourlyWeather.push(
        {
          time: (i * 3 + nowHour) % 24 + '时',
          iconPath: '/images/' + forecast[i].weather + '-icon.png',
          temp: forecast[i].temp + 'º'
        }
      )
    }
    hourlyWeather[0].time = '现在'

    this.setData({
      hourlyWeather: hourlyWeather
    })
  },

  setToday(result){
    let date = new Date()
    this.setData({
      todayTemp: `${result.today.minTemp}º - ${result.today.maxTemp}º`,
      todayDate: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDay()} 今天`
    })
  },

  onTapTodayWeather(){
    wx.navigateTo({
      url: '../list/list?city=' + this.data.currentCity,
    })
  },

  onTapLocation(){
      this.getCityAndWeather()
  },
    
  getCityAndWeather() {
    wx.getLocation({
      success: res => {
        this.setData({
          locationAuthType: AUTHORIZED
        })

        //console.log(res.latitude, res.longitude)
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: 39.984060,
            longitude: 116.307520
            //latitude: res.latitude,
            //longitude: res.longitude
          },
          success: res => {
            this.setData({
              currentCity: res.result.address_component.city
            })
            
            this.getNow()
          }
        })
      },

      fail: () => {
        this.setData({
          locationAuthType: UNAUTHORIZED
        })
      }
    })
  }
})