/*import 'bootstrap@4.6.0'
import $ from 'jquery'*/

// From: https://playcode.io/new/

console.log('App started')

// CONST
const directionUp = 'directionUp';
const directionDown = 'directionDown';
const negativeAccumulationCoefficient = 2;

// VARs creation/initialization:
var currentDirection;
var upStart;
var downStart;
var accumulation = 0;

function resetHtml () {
  $('#up-time')
    .html('UP TIME -');
  $('#down-time')
    .html('DOWN TIME');
  $('#accumulation-text')
    .html('<i>No accumulation, yet.</i>');
};
resetHtml();

// UP button definition:
$('#up-start')
  .html('UP START')
  .on('click', () => {
    console.log('-------------------');
    const now = Date.now();
    upStart = now;
    if (downStart != undefined) {
      const downFor = now - downStart;
      console.log('DOWN stopped after: '+ downFor);
      if ( (negativeAccumulationCoefficient != undefined) && (negativeAccumulationCoefficient != 1) ) {
        const rawNewAccumulation = accumulation - downFor;
        console.log('DOWN RAW new accumulation: '+ rawNewAccumulation);
        if (rawNewAccumulation >= 0) {
          accumulation = rawNewAccumulation;
          console.log('OK: DOWN accumulation is still positive: '+ accumulation);
        } else {
          accumulation = negativeAccumulationCoefficient * rawNewAccumulation;
          console.log('OH! DOWN accumulation has become NEGATIVE ('+ rawNewAccumulation +') so we have applied the configured coefficient ['+ negativeAccumulationCoefficient +']: '+ accumulation);
        }
      } else {
        accumulation -= downFor;
      }

      $('#down-time').html('Has been DOWN for ['+ downFor +' ms]');
      $('#accumulation-text').html('['+ accumulation +' ms] accumulated yet.');
    } else {
      console.log('First (UP) start click ...');

      $('#down-time').html('');
    }

    console.log('  UP started at: '+ upStart)
    
    $('#up-time').html('Now running up...');

    $('#down-start').prop('disabled', false);
    $('#up-start').prop('disabled', true);

    currentDirection = directionUp;
  });


// DOWN button definition:
$('#down-start')
  .html('DOWN START')
  .on('click', () => {
    console.log('-------------------');
    const now = Date.now();
    downStart = now
    if (upStart != undefined) {
      const upFor = now - upStart;
      accumulation += upFor;

      console.log('  UP stopped after: '+ upFor);
      console.log('  UP accumulation: '+ accumulation);

      $('#up-time').html('Has been UP for ['+ upFor +' ms]');
      $('#accumulation-text').html('['+ accumulation +' ms] accumulated yet.');
    } else {
      console.log('First (DOWN) start click ...');

      $('#up-time').html('');
    }

    console.log('DOWN started at: '+ downStart);

    $('#down-time').html('... Now running down');

    $('#up-start').prop('disabled', false);
    $('#down-start').prop('disabled', true);

    currentDirection = directionDown;
  });

$('#accumulation-refresh')
  .html('ACCUMULATION REFRESH')
  .on('click', () => {
    console.log('----');
    const refreshedAccumulation = calculateRefreshedAccumulation();
    if (refreshedAccumulation != undefined) {
      console.log('Refreshing with: '+ refreshedAccumulation);
      $('#accumulation-text').html('['+ refreshedAccumulation +' ms] accumulated yet.');
    } else {
      console.log('Not refreshing (refreshed accumulation is undefined).');
    }
    console.log('----');
  });

function calculateRefreshedAccumulation () {
  if (currentDirection != undefined) {
    var delta;
    if (currentDirection == directionUp) {
      console.log('Refreshing UP ...');
      const now = Date.now();
      delta = now - upStart;
    } else {
      if (currentDirection == directionDown) {
        console.log('Refreshing DOWN ...');
        const now = Date.now();
        delta = downStart - now;
      } else {
        console.log('Unknown direction! Unable to calculate a delta.');
      }
    }
    
    if (delta != undefined) {
      const refreshedAccumulation = accumulation + delta;
      console.log('Refreshed accumulation is: '+ refreshedAccumulation);
      return refreshedAccumulation;
    } else {
      console.log('Not calculating (delta is undefined).');
      return undefined;
    }
  } else {
    console.log('No direction taken yet; nothing to calculate.');
    return undefined;
  }
};

$('#stop-reset')
  .html('STOP and RESET')
  .on('click', () => {
    console.log('XXXXXXXXXXXXXXXXXXX');
    resetHtml();
    currentDirection = undefined;
    upStart = undefined;
    downStart = undefined;
    accumulation = 0;
    $('#up-start').prop('disabled', false);
    $('#down-start').prop('disabled', false);
    console.log('STOP and RESET: done.');
    console.log('XXXXXXXXXXXXXXXXXXX');
  });
