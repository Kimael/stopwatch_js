import 'bootstrap@4.6.0'
import $ from 'jquery'

// From: https://playcode.io/new/

console.log('App started')

var upStart = Date.now();
var downStart = Date.now();

var upAccumulation = 0;
var downAccumulation = 0;

$('#up-start')
  .html('UP START')
  .on('click', () => {
    const now = Date.now();
    const downFor = now - downStart;
    downAccumulation += downFor;
    upStart = now;

    console.log('-------------------');
    console.log('DOWN stopped after: '+ downFor);
    console.log('DOWN accumulation: '+ downAccumulation);
    console.log('  UP started at: '+ upStart)

    $('#down-start').prop('disabled', false);
    $('#up-start').prop('disabled', true);
  });

$('#down-start')
  .html('DOWN START')
  .on('click', () => {
    const now = Date.now();
    const upFor = now - upStart;
    upAccumulation += upFor;
    downStart = now

    console.log('-------------------');
    console.log('UP stopped after: '+ upFor);
    console.log('UP accumulation: '+ upAccumulation);
    console.log('DOWN started at: '+ downStart);

    $('#up-start').prop('disabled', false);
    $('#down-start').prop('disabled', true);
  });
