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

const UNPROMPTED_TIPS = "点击获取当前位置"
const UNAUTHORIZED_TIPS = "点击开启位置权限"
const AUTHORIZED_TIPS = ""

Page({
  data: {
    nowTemp: "",
    nowWeather: "",
    nowWeatherBG: "",
    hourlyWeather: [],
    todayDate:"",
    todayTemp:"",
    currentCity:"广州市",
    locationTipsText:UNPROMPTED_TIPS,
    locationAuthType:UNPROMPTED
  },

  onPullDownRefresh(){
    this.getNow(()=>{
      wx.stopPullDownRefresh()
    })
  },

  onLoad() {
    console.log('onLoad')

    // 实例化API核心类
    this.qqmapsdk = new QQMapWX({
      key: 'TZEBZ-QJVRW-JVPRQ-RJLTC-7FKTK-IPBTQ'
    });
    this.getNow()
  },

  onHide() {
    console.log('onHide')
  },

  onReady() {
    console.log('onReady')
  },

  onUnload() {
    console.log('onUnLoad')
  },

  onShow() {
    console.log('onShow')
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
      this.getLocation()
  },
    
  getLocation() {
    wx.getLocation({
      success: res => {
        this.setData({
          locationAuthType: AUTHORIZED,
          locationTipsText: AUTHORIZED_TIPS
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
              currentCity: res.result.address_component.city,
              locationTipsText: ""
            })
            
            this.getNow()
          }
        })
      },

      fail: () => {
        this.setData({
          locationAuthType: UNAUTHORIZED,
          locationTipsText: UNAUTHORIZED_TIPS
        })
      }
    })
  }
})