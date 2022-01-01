// From: https://playcode.io/new/

console.log('App started')

// CONST
const directionUp = 'directionUp';
const directionDown = 'directionDown';

const initialDownSpeed = 1; // 1.1 = 10% faster to go down than up.

const initialTooMuchDownPenaltyCoefficient = 2;
const penaltySeparator = '----------------------------------------------------------------------------------\n';

// You should adapt these 2 consts accordingly:
const malusUnit = 'minutes';
const malusUnitConversionFactor = 60000; // Converts typed minutes into (internaly used) miliseconds.
const initialMalusValue = 5; // 5 minutes.

// You should adapt these 2 consts accordingly:
const bonusUnit = 'minutes';
const bonusUnitConversionFactor = 60000; // Converts typed minutes into (internaly used) miliseconds.
const initialBonusValue = 1; // 1 minute.

const refreshAccumulationTimeoutDuration = 1000; // ie: refresh accumulation description text every 1 second.

// VARs creation/initialization:
var currentDirection;
var upStart;
var downStart;
var accumulation = 0;
var refreshAccumulationTimeout;
var pauseAt;
var pauseAccumulation = 0;


function resetHtml () {
  $('#down-speed')
    .val(initialDownSpeed);
  $('#too-much-down-penalty-coefficient')
    .val(initialTooMuchDownPenaltyCoefficient);

  $('#up-time')
    .html('UP TIME -');
  $('#down-time')
    .html('DOWN TIME');

  $('#bonus-value-label')
    .html(bonusUnit);
  $('#bonus-value')
    .val(initialBonusValue);

  $('#malus-value-label')
    .html(malusUnit);
  $('#malus-value')
    .val(initialMalusValue);
  
  $('#accumulation-text')
    .html('<i>No accumulation, yet.</i>');
  
  $('#activity-log')
    .val('\nLet\'s begin!') // Also works: .html('Let\'s begin!');
    .attr('rows', 30) // HTML was: style='height: 50%;'
    .attr('cols', 80); // HTML was: style='width: 80%'
};


function enableElementsOnStart () {
  $('#bonus-add').prop('disabled', false);
  $('#malus-add').prop('disabled', false);
  $('#accumulation-refresh').prop('disabled', false);
  $('#pause').prop('disabled', false);
  $('#stop-reset').prop('disabled', false);
};


function calculateRefreshedAccumulation () {
  if (currentDirection != undefined) {
    var deltaWithPauseAndSpeed;
    if (currentDirection == directionUp) {
      console.log('Refreshing UP ...');
      const now = Date.now();
      var rawDelta = now - upStart; // Positive
      var deltaWithPause = rawDelta - pauseAccumulation;
      if (! isNaN(pauseAt) ) {
        const currentPauseDelta = pauseAt - now; // Negative
        deltaWithPause += currentPauseDelta;
      }
      deltaWithPauseAndSpeed = deltaWithPause; // No UP speed;
    } else {
      if (currentDirection == directionDown) {
        console.log('Refreshing DOWN ...');
        const now = Date.now();
        const rawDelta = downStart - now; // Negative
        var deltaWithPause = rawDelta - pauseAccumulation;
        if (! isNaN(pauseAt) ) {
          const currentPauseDelta = now - pauseAt; // Positive
          deltaWithPause += currentPauseDelta;
        }

        const downSpeed = $('#down-speed').val();
        if ( ( !isNaN(downSpeed) ) && (downSpeed > 0) ) {
          deltaWithPauseAndSpeed = roundTimeComponent(deltaWithPause * downSpeed);
        } else {
          deltaWithPauseAndSpeed = deltaWithPause;
        }
      } else {
        console.log('Unknown direction! Unable to calculate a delta.');
      }
    }
    
    if (deltaWithPauseAndSpeed != undefined) {
      const refreshedAccumulation = accumulation + deltaWithPauseAndSpeed;
      console.log('Refreshed accumulation is: '+ refreshedAccumulation);
      return refreshedAccumulation;
    } else {
      console.log('Not calculating (delta is undefined).');
      return accumulation;
    }
  } else {
    console.log('No direction taken yet; nothing to calculate.');
    return accumulation;
  }
};

function refreshAccumulation () {
  console.log('\n----');
  const refreshedAccumulation = calculateRefreshedAccumulation();
  displayAccumulation(refreshedAccumulation);
  console.log('----');
};

function displayAccumulation (refreshedAccumulation) {
  if (refreshedAccumulation != undefined) {
    console.log('Refreshing with: '+ refreshedAccumulation);

    const absRefreshedAccumulation = Math.abs(refreshedAccumulation);
    const absRefreshedInSeconds = roundTimeComponent(Math.abs(refreshedAccumulation) / 1000);

    const absRefreshedMinutes = roundTimeComponent(absRefreshedAccumulation / 60000);
    const absRefreshedRemainingSeconds = roundTimeComponent(Math.abs(refreshedAccumulation % 60000) / 1000);

    console.log('Absolute accumulation in seconds=['+ absRefreshedInSeconds +']: minutes=['+ absRefreshedMinutes +'], seconds=['+ absRefreshedRemainingSeconds +'].')

    var newAccumulationHtml = '';

    if (refreshedAccumulation < 0) {
      if (absRefreshedInSeconds >= 1) {
        newAccumulationHtml += '<span style="color: red"><strong>-</strong> ';
      }
    }

    if (absRefreshedInSeconds < 1) {
      newAccumulationHtml += '<i>Not much accumulated.</i>';
    } else {
      if (absRefreshedMinutes > 0) {
        if (refreshedAccumulation > 0) {
          newAccumulationHtml += '<span style="color: green">';
        }
        newAccumulationHtml += absRefreshedMinutes +' minute';
        
        if (absRefreshedMinutes > 1) {
          newAccumulationHtml += 's';
        }
        if (refreshedAccumulation > 0) {
          newAccumulationHtml += '</span>';
        }
        
        if (absRefreshedRemainingSeconds > 0) {
          newAccumulationHtml += ' and ';
        }
      }

      if (absRefreshedRemainingSeconds > 0) {
        newAccumulationHtml += absRefreshedRemainingSeconds +' second';
        if (absRefreshedRemainingSeconds > 1) {
          newAccumulationHtml += 's';
        }
      }
      
      newAccumulationHtml += ' accumulated.';
      if (refreshedAccumulation < 0) {
        newAccumulationHtml += '</span>';
      }
    }
    
    $('#accumulation-text').html(newAccumulationHtml);
  } else {
    console.log('Not refreshing (refreshed accumulation is undefined).');
  }
};


function roundTimeComponent (timeComponent) {
  // Choose betwwen: Math.trunc, Math.round, Math.floor and Math.ceil:
  return Math.round(timeComponent);
}


// STARTING!
resetHtml();

// UP button definition:
$('#up-start')
  .html('UP START')
  .on('click', () => {
    $('#up-start').prop('disabled', true);

    console.log('\n-------------------');
    const now = Date.now();
    upStart = now;
    if (downStart != undefined) {
      const rawDownFor = now - downStart; // Positive
      console.log('DOWN stopped after: '+ rawDownFor);

      const downSpeed = $('#down-speed').val();
      if ( ( !isNaN(downSpeed) ) && (downSpeed > 0) ) {
        downFor = roundTimeComponent(rawDownFor * downSpeed);
      } else {
        downFor = rawDownFor;
      }

      const tooMuchDownPenaltyCoefficient = $('#too-much-down-penalty-coefficient').val();
      if ( ( !isNaN(tooMuchDownPenaltyCoefficient) ) && (tooMuchDownPenaltyCoefficient >= 1) ) {
        const rawNewAccumulation = accumulation - downFor + pauseAccumulation;
        console.log('DOWN RAW new accumulation: '+ rawNewAccumulation);
        if (rawNewAccumulation >= 0) {
          accumulation = rawNewAccumulation;
          console.log('OK: DOWN accumulation is still positive: '+ accumulation);
        } else {
          accumulation = tooMuchDownPenaltyCoefficient * rawNewAccumulation;
          console.log('OH! DOWN accumulation has become NEGATIVE ('+ rawNewAccumulation +') so we have applied the configured coefficient ['+ tooMuchDownPenaltyCoefficient +']: '+ accumulation);
          
          const activityLogMessage = 'You have been DOWN too much!\n  Applying penalty: replacing ['+ rawNewAccumulation +'] by ['+ accumulation +']!';
          const newActivityLog = penaltySeparator + activityLogMessage +'\n'+ penaltySeparator;
          appendActivityLog(newActivityLog);
        }
      } else {
        accumulation -= downFor + pauseAccumulation;
        pauseAccumulation = 0;
      }

      const newDownTimeMessage = 'Has been DOWN for ['+ downFor +' ms]';
      $('#down-time').html(newDownTimeMessage);
      appendActivityLog(newDownTimeMessage +'\n');

      displayAccumulation(accumulation);
    } else {
      enableElementsOnStart();

      const logMessage = 'First (UP) start click ...';
      console.log(logMessage);
      appendActivityLog(logMessage);

      refreshAccumulationLoop();

      $('#down-time').html('');
    }
    
    const logMessage = '^   UP started at: '+ upStart;
    console.log(logMessage);
    appendActivityLog(logMessage);

    $('#up-time')
      .html('<strong>Now running up ...</strong>');

    $('#down-start')
      .prop('disabled', false);

    currentDirection = directionUp;
  });


// DOWN button definition:
$('#down-start')
  .html('DOWN START')
  .on('click', () => {
    $('#down-start').prop('disabled', true);

    console.log('\n-------------------');
    const now = Date.now();
    downStart = now
    if (upStart != undefined) {
      const upFor = now - upStart; // Positive
      accumulation += upFor + pauseAccumulation;
      pauseAccumulation = 0;

      console.log('  UP stopped after: '+ upFor);
      console.log('  UP accumulation: '+ accumulation);

      const newUpTimeMessage = 'Has been UP for ['+ upFor +' ms]';
      $('#up-time').html(newUpTimeMessage);
      appendActivityLog(newUpTimeMessage +'\n');

      displayAccumulation(accumulation);
    } else {
      enableElementsOnStart();

      const logMessage = 'First (DOWN) start click ...';
      console.log(logMessage);
      appendActivityLog(logMessage);

      refreshAccumulationLoop();

      $('#up-time').html('');
    }

    const logMessage = 'v DOWN started at: '+ downStart;
    console.log(logMessage);
    appendActivityLog(logMessage);

    $('#down-time')
      .html('<strong>... Now running down</strong>');

    $('#up-start')
      .prop('disabled', false);

    currentDirection = directionDown;
  });


function refreshAccumulationLoop () {
  refreshAccumulation();
  refreshAccumulationTimeout = setTimeout(refreshAccumulationLoop, refreshAccumulationTimeoutDuration);
}



$('#accumulation-refresh')
  .prop('disabled', true)
  .html('ACCUMULATION REFRESH')
  .on('click', () => { 
    refreshAccumulation();
  });


$('#bonus-add')
  .html('ADD BONUS')
  .on('click', () => {
    const typedBonusValue = $('#bonus-value').val();
    if (isNaN(typedBonusValue)) {
      const logMessage = '!! Typed bonus value is NOT a number; unable to add it!';
      console.log(logMessage);
      appendActivityLog(logMessage +'\n');
    } else {
      if (typedBonusValue > 0) {
        const internalBonusValue = typedBonusValue * bonusUnitConversionFactor;
        const oldAccumulation = accumulation;
        accumulation += internalBonusValue; // + pauseAccumulation;

        const logMessage = 'Typed bonus value ['+ typedBonusValue +'] is a valid number; adding internal bonus ['+ internalBonusValue +']: moving accumulation from ['+ oldAccumulation +'] to ['+ accumulation +'].';
        console.log(logMessage);

        const activityLog = '^^ Adding a bonus of '+ typedBonusValue +' '+ bonusUnit +'.';
        appendActivityLog(activityLog +'\n');
        
        refreshAccumulation();

        $('#stop-reset').prop('disabled', false);
      } else {
        const logMessage = '! Typed bonus value ['+ typedBonusValue +'] is NOT a valid number; NOT adding it!';
        console.log(logMessage);
        appendActivityLog(logMessage +'\n');
      }
    }
  });


$('#malus-add')
  .html('REMOVE MALUS')
  .on('click', () => {
    const typedMalusValue = $('#malus-value').val();
    if (isNaN(typedMalusValue)) {
      const logMessage = '!! Typed malus value is NOT a number; unable to add it!';
      console.log(logMessage);
      appendActivityLog(logMessage +'\n');
    } else {
      if (typedMalusValue > 0) {
        const internalMalusValue = typedMalusValue * malusUnitConversionFactor;
        const oldAccumulation = accumulation;
        accumulation -= internalMalusValue; // - pauseAccumulation;

        const logMessage = 'Typed malus value ['+ typedMalusValue +'] is a valid number; adding internal malus ['+ internalMalusValue +']: moving accumulation from ['+ oldAccumulation +'] to ['+ accumulation +'].';
        console.log(logMessage);

        const activityLog = 'VV Removing a malus of '+ typedMalusValue +' '+ malusUnit +'.';
        appendActivityLog(activityLog +'\n');
        
        refreshAccumulation();

        $('#stop-reset').prop('disabled', false);
      } else {
        const logMessage = '! Typed malus value ['+ typedMalusValue +'] is NOT a valid number; NOT adding it!';
        console.log(logMessage);
        appendActivityLog(logMessage +'\n');
      }
    }
  });


$('#pause')
  .prop('disabled', true)
  .html('PAUSE')
  .on('click', () => {
    $('#pause').prop('disabled', true);
    $('#up-start').prop('disabled', true);
    $('#down-start').prop('disabled', true);
    $('#accumulation-refresh').prop('disabled', true)

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
    $('#bonus-add').prop('disabled', false);
    $('#malus-add').prop('disabled', false);
    console.log('===================');
  });


$('#resume')
  .prop('disabled', true)
  .html('RESUME')
  .on('click', () => {
    $('#resume').prop('disabled', true);

    console.log('\n===================');
    const now = Date.now();
    const logMessage = '>> RESUME at: '+ now;
    console.log(logMessage);
    appendActivityLog(logMessage +'\n');

    if (currentDirection != undefined) {
      var delta;
      if (currentDirection == directionUp) {
        const now = Date.now();
        delta = pauseAt - now; // Negative
      } else {
        if (currentDirection == directionDown) {
          const now = Date.now();
          delta = now - pauseAt; // Positive
        } else {
          console.log('ERROR: unknown direction; unable to calculate a delta and resume!');
        }
      }
    } else {
      console.log('ERROR: no direction taken yet; unable to resume!');
    }
    pauseAt = undefined;

    /* With 'pauseAccumulation' usage: */
    if (delta != undefined) {
      const oldPauseAccumulation = pauseAccumulation;
      pauseAccumulation -= delta;
      console.log('Pause accumulation moves from ['+ oldPauseAccumulation +'] to ['+ pauseAccumulation +']. Delta is ['+ delta +'].');
    } else {
      console.log('Not calculating pause accumulation, as delta is undefined!');
    }

    refreshAccumulationLoop();

    enableElementsOnStart();

    if (currentDirection != undefined) {
      if (currentDirection == directionUp) {
        $('#down-start').prop('disabled', false);
      } else {
        if (currentDirection == directionDown) {
          $('#up-start').prop('disabled', false);
        } else {
          console.log('Unknown direction! Unable to enable any "START" button.');
        }
      }
    } else {
      console.log('No direction taken yet! Unable to enable any "START" button.');
    }
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
    $('#stop-reset').prop('disabled', true);
    //You can add a bonus before you start: $('#bonus-add').prop('disabled', true);
    //You can add a malus before you start: $('#malus-add').prop('disabled', true);
    $('#accumulation-refresh').prop('disabled', true);
    $('#pause').prop('disabled', true);
    $('#resume').prop('disabled', true);

    console.log('\nXXXXXXXXXXXXXXXXXXX');
    
    resetHtml();
    
    currentDirection = undefined;
    upStart = undefined;
    downStart = undefined;
    accumulation = 0;
    pauseAt = undefined;
    pauseAccumulation = 0;

    if (refreshAccumulationTimeout != undefined) {
      clearTimeout(refreshAccumulationTimeout);
    }

    $('#up-start').prop('disabled', false);
    $('#down-start').prop('disabled', false);

    console.log('STOP and RESET: done.');
    console.log('XXXXXXXXXXXXXXXXXXX');
  });
