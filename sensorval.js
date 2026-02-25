function sensorval( sensor,tempval,doorstate) {
  this.sensor = sensor;
  this.tempval = tempval;
  this.doorstate = doorstate;
}

sensorval.prototype.logValue = function() {
  console.log('Sensor', this.sensor);
  console.log('tempval', this.tempval);
  console.log('doorstate', this.doorstate);
  return this;
}

sensorval.prototype.getSensor = function() {
  return this.sensor;
}
sensorval.prototype.gettempval = function() {
  return this.tempval;
}
sensorval.prototype.getdoorstate = function() {
  return this.doorstate;
}

export default sensorval;
