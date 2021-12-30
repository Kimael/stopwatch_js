// From: https://playcode.io/new/

console.log('App started')

// CONST
const directionUp = 'directionUp';
const directionDown = 'directionDown';
const negativeAccumulationCoefficient = 2;
const penaltySeparator = '----------------------------------------------------------------------------------\n';

// VARs creation/initialization:
var currentDirection;
var upStart;
var downStart;
var accumulation = 0;
var refreshAccumulationTimeout;
var pauseAt;


function resetHtml () {
  $('#up-time')
    .html('UP TIME -');
  $('#down-time')
    .html('DOWN TIME');
  $('#accumulation-text')
    .html('<i>No accumulation, yet.</i>');
  $('#activity-log')
    .val('\nLet\'s begin!'); // Also works: .html('Let\'s begin!');
};
resetHtml();


// UP button definition:
$('#up-start')
  .html('UP START')
  .on('click', () => {
    console.log('\n-------------------');
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
          
          const activityLogMessage = 'You have been DOWN too much!\n  Applying penalty: replacing ['+ rawNewAccumulation +'] by ['+ accumulation +']!';
          const newActivityLog = penaltySeparator + activityLogMessage +'\n'+ penaltySeparator;
          appendActivityLog(newActivityLog);
        }
      } else {
        accumulation -= downFor;
      }

      const newDownTimeMessage = 'Has been DOWN for ['+ downFor +' ms]';
      $('#down-time').html(newDownTimeMessage);
      appendActivityLog(newDownTimeMessage +'\n');

      $('#accumulation-text').html('['+ accumulation +' ms] accumulated yet.');
    } else {
      $('#accumulation-refresh').prop('disabled', false);
      $('#pause').prop('disabled', false);
      $('#stop-reset').prop('disabled', false);

      const logMessage = 'First (UP) start click ...';
      console.log(logMessage);
      appendActivityLog(logMessage);

      refreshAccumulationTimeout = setTimeout(refreshAccumulationLoop, 2000);

      $('#down-time').html('');
    }
    
    const logMessage = '^   UP started at: '+ upStart;
    console.log(logMessage);
    appendActivityLog(logMessage);

    $('#up-time').html('Now running up...');

    $('#down-start').prop('disabled', false);
    $('#up-start').prop('disabled', true);

    currentDirection = directionUp;
  });


// DOWN button definition:
$('#down-start')
  .html('DOWN START')
  .on('click', () => {
    console.log('\n-------------------');
    const now = Date.now();
    downStart = now
    if (upStart != undefined) {
      const upFor = now - upStart;
      accumulation += upFor;

      console.log('  UP stopped after: '+ upFor);
      console.log('  UP accumulation: '+ accumulation);

      const newUpTimeMessage = 'Has been UP for ['+ upFor +' ms]';
      $('#up-time').html(newUpTimeMessage);
      appendActivityLog(newUpTimeMessage +'\n');

      $('#accumulation-text').html('['+ accumulation +' ms] accumulated yet.');
    } else {
      $('#accumulation-refresh').prop('disabled', false);
      $('#pause').prop('disabled', false);
      $('#stop-reset').prop('disabled', false);

      const logMessage = 'First (DOWN) start click ...';
      console.log(logMessage);
      appendActivityLog(logMessage);

      refreshAccumulationTimeout = setTimeout(refreshAccumulationLoop, 2000);

      $('#up-time').html('');
    }

    const logMessage = 'v DOWN started at: '+ downStart;
    console.log(logMessage);
    appendActivityLog(logMessage);

    $('#down-time').html('... Now running down');

    $('#up-start').prop('disabled', false);
    $('#down-start').prop('disabled', true);

    currentDirection = directionDown;
  });

function refreshAccumulationLoop () {
  refreshAccumulation();
  refreshAccumulationTimeout = setTimeout(refreshAccumulationLoop, 2000);
}

function refreshAccumulation () {
  console.log('\n----');
  const refreshedAccumulation = calculateRefreshedAccumulation();
  if (refreshedAccumulation != undefined) {
    console.log('Refreshing with: '+ refreshedAccumulation);
    $('#accumulation-text').html('['+ refreshedAccumulation +' ms] accumulated yet.');
  } else {
    console.log('Not refreshing (refreshed accumulation is undefined).');
  }
  console.log('----');
}

$('#accumulation-refresh')
  .prop('disabled', true)
  .html('ACCUMULATION REFRESH')
  .on('click', () => { refreshAccumulation(); } );


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


$('#pause')
  .prop('disabled', true)
  .html('PAUSE')
  .on('click', () => {
    console.log('\n===================');
    const now = Date.now();
    const logMessage = '== PAUSE at: '+ now;
    console.log(logMessage);
    appendActivityLog(logMessage +'\n');

    if (refreshAccumulationTimeout != undefined) {
      clearTimeout(refreshAccumulationTimeout);
    }
    
    pauseAt = now;

    $('#resume').prop('disabled', false);
    $('#accumulation-refresh').prop('disabled', true)
    $('#pause').prop('disabled', true);
    console.log('===================');
  });

$('#resume')
  .prop('disabled', true)
  .html('RESUME')
  .on('click', () => {
    console.log('\n===================');
    const now = Date.now();
    const logMessage = '>> RESUME at: '+ now;
    console.log(logMessage);
    appendActivityLog(logMessage +'\n');

    if (currentDirection != undefined) {
      var delta;
      if (currentDirection == directionUp) {
        const now = Date.now();
        delta = pauseAt - now;
      } else {
        if (currentDirection == directionDown) {
          const now = Date.now();
          delta = now - pauseAt;
        } else {
          console.log('ERROR: unknown direction; unable to calculate a delta and resume!');
        }
      }
    } else {
      console.log('ERROR: no direction taken yet; unable to resume!');
    }
    pauseAt = undefined;

    if (delta != undefined) {
      const resumedAccumulation = accumulation + delta;
      console.log('Paused accumulation was ['+ accumulation +']; resumed accumulation is ['+ resumedAccumulation +']; delta id ['+ delta +']');
      accumulation = resumedAccumulation;
    } else {
      console.log('Not calculating (delta is undefined).');
    }

    refreshAccumulationTimeout = setTimeout(refreshAccumulationLoop, 2000);

    $('#pause').prop('disabled', false);
    $('#accumulation-refresh').prop('disabled', false)
    $('#resume').prop('disabled', true);
    console.log('===================');
  });


function appendActivityLog (pActivityLog) {
  const newActivityLogVal = pActivityLog +'\n'+ $('#activity-log').val();
  $('#activity-log').val(newActivityLogVal);
}

$('#stop-reset')
  .prop('disabled', true)
  .html('STOP and RESET')
  .on('click', () => {
    console.log('\nXXXXXXXXXXXXXXXXXXX');
    
    resetHtml();
    
    currentDirection = undefined;
    upStart = undefined;
    downStart = undefined;
    accumulation = 0;
    pauseAt = undefined;

    if (refreshAccumulationTimeout != undefined) {
      clearTimeout(refreshAccumulationTimeout);
    }

    $('#up-start').prop('disabled', false);
    $('#down-start').prop('disabled', false);
    $('#accumulation-refresh').prop('disabled', true);
    $('#pause').prop('disabled', true);
    $('#resume').prop('disabled', true);
    $('#stop-reset').prop('disabled', true);
    
    console.log('STOP and RESET: done.');
    console.log('XXXXXXXXXXXXXXXXXXX');
  });
