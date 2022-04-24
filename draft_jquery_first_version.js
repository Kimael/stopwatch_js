// From: https://playcode.io/new/

console.log('App started')

// CONSTants
const G_DIRECTION_UP = 'directionUp';
const G_DIRECTION_DOWN = 'directionDown';

//const initialDownSpeed = 1; // same speed up or down
//const G_INITIAL_DOWN_SPEED = 1.1; // 10% faster to go down than up.
const G_INITIAL_DOWN_SPEED = 1.9; // 90% faster to go down than up.

const G_INITIAL_TOO_MUCH_DOWN_PENALTY_COEFFICIENT = 2;
const G_PENALTY_SEPARATOR = '----------------------------------------------------------------------------------\n';

// You should adapt these 2 consts accordingly:
const G_MALUS_UNIT = 'minutes';
const G_MALUS_UNIT_CONVERSION_FACTOR = 60000; // Converts typed minutes into (internaly used) miliseconds.
const G_INITIAL_MALUS_VALUE = 5; // 5 minutes.

// You should adapt these 2 consts accordingly:
const G_BONUS_UNIT = 'minutes';
const G_BONUS_UNIT_CONVERSION_FACTOR = 60000; // Converts typed minutes into (internaly used) milliseconds.
const G_INITIAL_BONUS_VALUE = 1; // 1 minute.

const G_REFRESH_ACCUMULATION_TIMEOUT_DURATION = 1000; // ie: refresh accumulation description text every 1 second.

// VARs creation/initialization:
var gCurrentDirection;
var gUpStart;
var gDownStart;
var gAccumulation = 0;
var gRefreshAccumulationTimeout;
var gPauseAt;
var gPauseAccumulation = 0;


function resetHtml () {
  $('#down-speed')
    .val(G_INITIAL_DOWN_SPEED);
  $('#too-much-down-penalty-coefficient')
    .val(G_INITIAL_TOO_MUCH_DOWN_PENALTY_COEFFICIENT);

  $('#up-time')
    .html('UP TIME -');
  $('#down-time')
    .html('DOWN TIME');

  $('#bonus-value-label')
    .html(G_BONUS_UNIT);
  $('#bonus-value')
    .val(G_INITIAL_BONUS_VALUE);

  $('#malus-value-label')
    .html(G_MALUS_UNIT);
  $('#malus-value')
    .val(G_INITIAL_MALUS_VALUE);
  
  $('#accumulation-text')
    .html('<i>No accumulation, yet.</i><br />');
  
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


function getSafeDownSpeed () {
  const downSpeedElement = $('#down-speed');
  if (downSpeedElement != undefined) {
    const rawDownSpeedRawValue = downSpeedElement.val();
    if ( ! isNaN(rawDownSpeedRawValue) ) {
      if (rawDownSpeedRawValue > 0) {
        return rawDownSpeedRawValue;
      } else {
        console.log('Invalid "<= 0" down speed: '+ rawDownSpeedRawValue);
      }
    } else {
      console.log('Invalid "NaN" down speed: '+ rawDownSpeedRawValue);
    }
  } else {
    console.log('Missing down speed field!');
  }

  // Default is a neutral speed:
  return 1;
}


function calculateRefreshedAccumulation () {
  if (gCurrentDirection != undefined) {
    var deltaWithPauseAndSpeed;
    if (gCurrentDirection == G_DIRECTION_UP) {
      console.log('Refreshing UP ...');
      const now = Date.now();
      var rawDelta = now - gUpStart; // Positive
      var deltaWithPause = rawDelta - gPauseAccumulation;
      if (! isNaN(gPauseAt) ) {
        const currentPauseDelta = gPauseAt - now; // Negative
        deltaWithPause += currentPauseDelta;
      }
      deltaWithPauseAndSpeed = deltaWithPause; // No UP speed;
    } else {
      if (gCurrentDirection == G_DIRECTION_DOWN) {
        console.log('Refreshing DOWN ...');
        const now = Date.now();
        const rawDelta = gDownStart - now; // Negative
        var deltaWithPause = rawDelta - gPauseAccumulation;
        if (! isNaN(gPauseAt) ) {
          const currentPauseDelta = now - gPauseAt; // Positive
          deltaWithPause += currentPauseDelta;
        }

        const safeDownSpeed = getSafeDownSpeed();
        if ( safeDownSpeed != 1) {
          deltaWithPauseAndSpeed = roundTimeComponent(deltaWithPause * safeDownSpeed);
        } else {
          deltaWithPauseAndSpeed = deltaWithPause;
        }
      } else {
        console.log('Unknown direction! Unable to calculate a delta.');
      }
    }
    
    if (deltaWithPauseAndSpeed != undefined) {
      const refreshedAccumulation = gAccumulation + deltaWithPauseAndSpeed;
      console.log('Refreshed accumulation is: '+ refreshedAccumulation);
      return refreshedAccumulation;
    } else {
      console.log('Not calculating (delta is undefined).');
      return gAccumulation;
    }
  } else {
    console.log('No direction taken yet; nothing to calculate.');
    return gAccumulation;
  }
};

function refreshAccumulation () {
  console.log('\n----');
  const refreshedAccumulation = calculateRefreshedAccumulation();
  displayAccumulation(refreshedAccumulation);
  console.log('----');
};

function decomposeAndRoundTimeMs (pTimeMs) {
  const seconds = roundTimeComponent(pTimeMs / 1000);

  const secondsPart = roundTimeComponent( (pTimeMs % 60000) / 1000 );
  const minutesPart = roundTimeComponent(pTimeMs / 60000);
  const hoursPart = roundTimeComponent(pTimeMs / 3600000);

  const result = {
    'seconds': seconds,

    'secondsPart': secondsPart,
    'minutesPart': minutesPart,
      'hoursPart': hoursPart
  };
  return result;
}

function displayAccumulation (pRefreshedAccumulation) {
  if (pRefreshedAccumulation != undefined) {
    console.log('Refreshing with: '+ pRefreshedAccumulation);

    const absRefreshedAccumulation = Math.abs(pRefreshedAccumulation);
    /*Was:
    const absRefreshedInSeconds = roundTimeComponent(absRefreshedAccumulation / 1000);

    const absRefreshedMinutes = roundTimeComponent(absRefreshedAccumulation / 60000);
    const absRefreshedRemainingSeconds = roundTimeComponent( (absRefreshedAccumulation % 60000) / 1000 );
    */
    const decomposedAndRoundRefreshedAccumulation = decomposeAndRoundTimeMs(absRefreshedAccumulation);
    /* First version OK: */
    const absRefreshedInSeconds = decomposedAndRoundRefreshedAccumulation.seconds;
    const absRefreshedRemainingSeconds = decomposedAndRoundRefreshedAccumulation.secondsPart;
    const absRefreshedMinutes = decomposedAndRoundRefreshedAccumulation.minutesPart;
    /* */
    /* ES6 version KO:
    const { absRefreshedInSeconds, absRefreshedRemainingSeconds, absRefreshedMinutes } = decomposedAndRoundRefreshedAccumulation;
    */

    console.log('Absolute accumulation in seconds=['+ absRefreshedInSeconds +']: minutes=['+ absRefreshedMinutes +'], seconds=['+ absRefreshedRemainingSeconds +'].')

    var realAccumulationHtml = '';

    if (absRefreshedInSeconds < 1) {
      realAccumulationHtml += '<i>Not much accumulated.</i>';
    } else {
      
      // = COLORING red or green:
      if (pRefreshedAccumulation < 0) {

        // Opening a red span.
        realAccumulationHtml += '<span style="color: red"><strong>-</strong> '        
      } else {
        if (pRefreshedAccumulation > 0) {
          if (absRefreshedMinutes > 0) {

            // Opening a green span.
            realAccumulationHtml += '<span style="color: green">';
          }
        }
        // else "refreshedAccumulation == 0" so we don't use any color.
      }

      // = MINUTES part:
      if (absRefreshedMinutes > 0) {
        realAccumulationHtml += absRefreshedMinutes +' minute';
        
        if (absRefreshedMinutes > 1) {
          realAccumulationHtml += 's';
        }

        // Early closing the green span, as we want it for the minutes part only.
        if (pRefreshedAccumulation > 0) {
          realAccumulationHtml += '</span>';
        }
        
        // Preparing the seconds part (as we have displayed a minutes part):
        if (absRefreshedRemainingSeconds > 0) {
          realAccumulationHtml += ' and ';
        }
      }

      // SECONDS part:
      if (absRefreshedRemainingSeconds > 0) {
        realAccumulationHtml += absRefreshedRemainingSeconds +' second';

        if (absRefreshedRemainingSeconds > 1) {
          realAccumulationHtml += 's';
        }
      }
      
      realAccumulationHtml += ' accumulated.';
      if (pRefreshedAccumulation < 0) {
        realAccumulationHtml += '</span>'; // Closing the red span.
      }
    }
    

    // DOWN accumulation handling:
    var downAccumulationHtml = '';

    /* When positive and down speed is not "1",
        we indicate the actual down time it will take to consume all the accumulated time. */
    var doDisplayDownAccumulation = false;
    if (pRefreshedAccumulation > 0) {
      const safeDownSpeed = getSafeDownSpeed();
      if (safeDownSpeed != 1) {
        const rawDownAccumulation = pRefreshedAccumulation / safeDownSpeed;
        const decomposedAndRoundRawDownAccumulation = decomposeAndRoundTimeMs(rawDownAccumulation);
        const downAccumulationInSeconds = decomposedAndRoundRawDownAccumulation.seconds;
        if (downAccumulationInSeconds > 0) {
          if (downAccumulationInSeconds < absRefreshedInSeconds) {
            // On debugging purpose only: newAccumulationHtml += 'Actualy ['+ downAccumulationInSeconds +' s] with down speed ['+ safeDownSpeed +'].'
            doDisplayDownAccumulation = true;

            downAccumulationHtml += 'Actualy ';

            const downAccumulationRemainingSeconds = decomposedAndRoundRawDownAccumulation.secondsPart;
            const downAccumulationMinutes = decomposedAndRoundRawDownAccumulation.minutesPart;
            
            if (downAccumulationMinutes > 0) {

              // Opening a green span.
              downAccumulationHtml += '<span style="color: green">';

              downAccumulationHtml += downAccumulationMinutes +' minute';
              
              if (downAccumulationMinutes > 1) {
                downAccumulationHtml += 's';
              }
              
              // Early closing the green span, as we want it for the minutes part only.
              downAccumulationHtml += '</span>';
              
              // Preparing the seconds part (as we have displayed a minutes part):
              if (downAccumulationRemainingSeconds > 0) {
                downAccumulationHtml += ' and ';
              }
            }
    
            // SECONDS part:
            if (downAccumulationRemainingSeconds > 0) {
              downAccumulationHtml += downAccumulationRemainingSeconds +' second';
    
              if (downAccumulationRemainingSeconds > 1) {
                downAccumulationHtml += 's';
              }
            }

            downAccumulationHtml += ' with configured down speed.'
          }  // Else, down accumuation is the same, so it does not make sense to display anything more.
        } // Else, there is too few to show, so it does not make sense to display anything more.
      } // Else, the down speed is neutral, so it does not make sense to display anything more.
    } // Else, we are already negative, so it does not make sense to display anything more.

    // ASSEMBLING two parts:
    var finalRealAccumulationHtml;
    var finalDownAccumulationHtml;
    if (gCurrentDirection == G_DIRECTION_UP) {
      finalRealAccumulationHtml = '<strong>'+ realAccumulationHtml +'</strong>';
      if (doDisplayDownAccumulation) {
        finalDownAccumulationHtml = '<i>'+ downAccumulationHtml +'</i>';
      } else {
        finalDownAccumulationHtml = '';
      }
    } else {
      if (gCurrentDirection == G_DIRECTION_DOWN) {
        if (doDisplayDownAccumulation) {
          finalRealAccumulationHtml = '<i>'+ realAccumulationHtml +'</i>';
          finalDownAccumulationHtml = '<strong>'+ downAccumulationHtml +'</strong>';
        } else {
          finalRealAccumulationHtml = '<strong>'+ realAccumulationHtml +'</strong>';
          finalDownAccumulationHtml = '';
        }
      } else {
        finalRealAccumulationHtml = realAccumulationHtml;
        finalDownAccumulationHtml = downAccumulationHtml;
        console.log('Unkown direction: '+ gCurrentDirection);
      }
    }

    const newAccumulationHtml = finalRealAccumulationHtml +'<br />'+ finalDownAccumulationHtml;
    $('#accumulation-text')
      .html(newAccumulationHtml);
    
  } else {
    console.log('Not refreshing (refreshed accumulation is undefined).');
  }
};


function roundTimeComponent (pTimeComponent) {
  // Choose betwwen: Math.trunc, Math.round, Math.floor and Math.ceil:
  //return Math.round(pTimeComponent);
  return Math.trunc(pTimeComponent);
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
    gUpStart = now;
    if (gDownStart != undefined) {
      const rawDownFor = now - gDownStart; // Positive
      console.log('DOWN stopped after: '+ rawDownFor);

      const safeDownSpeed = getSafeDownSpeed();
      if (safeDownSpeed != 1) {
        downFor = roundTimeComponent(rawDownFor * safeDownSpeed);
      } else {
        downFor = rawDownFor;
      }

      const tooMuchDownPenaltyCoefficient = $('#too-much-down-penalty-coefficient').val();
      if ( ( !isNaN(tooMuchDownPenaltyCoefficient) ) && (tooMuchDownPenaltyCoefficient >= 1) ) {
        const rawNewAccumulation = gAccumulation - downFor + gPauseAccumulation;
        console.log('DOWN RAW new accumulation: '+ rawNewAccumulation);
        if (rawNewAccumulation >= 0) {
          gAccumulation = rawNewAccumulation;
          console.log('OK: DOWN accumulation is still positive: '+ gAccumulation);
        } else {
          gAccumulation = tooMuchDownPenaltyCoefficient * rawNewAccumulation;
          console.log('OH! DOWN accumulation has become NEGATIVE ('+ rawNewAccumulation +') so we have applied the configured coefficient ['+ tooMuchDownPenaltyCoefficient +']: '+ gAccumulation);
          
          const activityLogMessage = 'You have been DOWN too much!\n  Applying penalty: replacing ['+ rawNewAccumulation +'] by ['+ gAccumulation +']!';
          const newActivityLog = G_PENALTY_SEPARATOR + activityLogMessage +'\n'+ G_PENALTY_SEPARATOR;
          appendActivityLog(newActivityLog);
        }
      } else {
        gAccumulation -= downFor + gPauseAccumulation;
        gPauseAccumulation = 0;
      }

      const newDownTimeMessage = 'Has been DOWN for ['+ downFor +' ms]';
      $('#down-time').html(newDownTimeMessage);
      appendActivityLog(newDownTimeMessage +'\n');

      displayAccumulation(gAccumulation);
    } else {
      enableElementsOnStart();

      const logMessage = 'First (UP) start click ...';
      console.log(logMessage);
      appendActivityLog(logMessage);

      refreshAccumulationLoop();

      $('#down-time').html('');
    }
    
    const logMessage = '^   UP started at: '+ gUpStart;
    console.log(logMessage);
    appendActivityLog(logMessage);

    $('#up-time')
      .html('<strong>Now running up ...</strong>');

    $('#down-start')
      .prop('disabled', false);

    gCurrentDirection = G_DIRECTION_UP;
  });


// DOWN button definition:
$('#down-start')
  .html('DOWN START')
  .on('click', () => {
    $('#down-start').prop('disabled', true);

    console.log('\n-------------------');
    const now = Date.now();
    gDownStart = now
    if (gUpStart != undefined) {
      const upFor = now - gUpStart; // Positive
      gAccumulation += upFor + gPauseAccumulation;
      gPauseAccumulation = 0;

      console.log('  UP stopped after: '+ upFor);
      console.log('  UP accumulation: '+ gAccumulation);

      const newUpTimeMessage = 'Has been UP for ['+ upFor +' ms]';
      $('#up-time').html(newUpTimeMessage);
      appendActivityLog(newUpTimeMessage +'\n');

      displayAccumulation(gAccumulation);
    } else {
      enableElementsOnStart();

      const logMessage = 'First (DOWN) start click ...';
      console.log(logMessage);
      appendActivityLog(logMessage);

      refreshAccumulationLoop();

      $('#up-time').html('');
    }

    const logMessage = 'v DOWN started at: '+ gDownStart;
    console.log(logMessage);
    appendActivityLog(logMessage);

    $('#down-time')
      .html('<strong>... Now running down</strong>');

    $('#up-start')
      .prop('disabled', false);

    gCurrentDirection = G_DIRECTION_DOWN;
  });


function refreshAccumulationLoop () {
  refreshAccumulation();
  gRefreshAccumulationTimeout = setTimeout(refreshAccumulationLoop, G_REFRESH_ACCUMULATION_TIMEOUT_DURATION);
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
        const internalBonusValue = typedBonusValue * G_BONUS_UNIT_CONVERSION_FACTOR;
        const oldAccumulation = gAccumulation;
        gAccumulation += internalBonusValue; // + pauseAccumulation;

        const logMessage = 'Typed bonus value ['+ typedBonusValue +'] is a valid number; adding internal bonus ['+ internalBonusValue +']: moving accumulation from ['+ oldAccumulation +'] to ['+ gAccumulation +'].';
        console.log(logMessage);

        const activityLog = '^^ Adding a bonus of '+ typedBonusValue +' '+ G_BONUS_UNIT +'.';
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
        const internalMalusValue = typedMalusValue * G_MALUS_UNIT_CONVERSION_FACTOR;
        const oldAccumulation = gAccumulation;
        gAccumulation -= internalMalusValue; // - pauseAccumulation;

        const logMessage = 'Typed malus value ['+ typedMalusValue +'] is a valid number; adding internal malus ['+ internalMalusValue +']: moving accumulation from ['+ oldAccumulation +'] to ['+ gAccumulation +'].';
        console.log(logMessage);

        const activityLog = 'VV Removing a malus of '+ typedMalusValue +' '+ G_MALUS_UNIT +'.';
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

    if (gRefreshAccumulationTimeout != undefined) {
      clearTimeout(gRefreshAccumulationTimeout);
    }
    
    gPauseAt = now;

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

    if (gCurrentDirection != undefined) {
      var delta;
      if (gCurrentDirection == G_DIRECTION_UP) {
        const now = Date.now();
        delta = gPauseAt - now; // Negative
      } else {
        if (gCurrentDirection == G_DIRECTION_DOWN) {
          const now = Date.now();
          delta = now - gPauseAt; // Positive
        } else {
          console.log('ERROR: unknown direction; unable to calculate a delta and resume!');
        }
      }
    } else {
      console.log('ERROR: no direction taken yet; unable to resume!');
    }
    gPauseAt = undefined;

    /* With 'pauseAccumulation' usage: */
    if (delta != undefined) {
      const oldPauseAccumulation = gPauseAccumulation;
      gPauseAccumulation -= delta;
      console.log('Pause accumulation moves from ['+ oldPauseAccumulation +'] to ['+ gPauseAccumulation +']. Delta is ['+ delta +'].');
    } else {
      console.log('Not calculating pause accumulation, as delta is undefined!');
    }

    refreshAccumulationLoop();

    enableElementsOnStart();

    if (gCurrentDirection != undefined) {
      if (gCurrentDirection == G_DIRECTION_UP) {
        $('#down-start').prop('disabled', false);
      } else {
        if (gCurrentDirection == G_DIRECTION_DOWN) {
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

    $('#stop-reset-abort').prop('disabled', false);
    $('#stop-reset-confirm').prop('disabled', false);
  });

$('#stop-reset-abort')
  .prop('disabled', true)
  .html('ABORT STOP and RESET')
  .on('click', () => {
    $('#stop-reset-abort').prop('disabled', true);
    $('#stop-reset-confirm').prop('disabled', true);
    
    $('#stop-reset').prop('disabled', false);
  });

$('#stop-reset-confirm')
  .prop('disabled', true)
  .html('CONFIRM STOP and RESET')
  .on('click', () => {
    $('#stop-reset-confirm').prop('disabled', true);
    $('#stop-reset-abort').prop('disabled', true);

    //You can add a bonus before you start: $('#bonus-add').prop('disabled', true);
    //You can add a malus before you start: $('#malus-add').prop('disabled', true);
    $('#accumulation-refresh').prop('disabled', true);
    $('#pause').prop('disabled', true);
    $('#resume').prop('disabled', true);

    console.log('\nXXXXXXXXXXXXXXXXXXX');
    
    resetHtml();
    
    gCurrentDirection = undefined;
    gUpStart = undefined;
    gDownStart = undefined;
    gAccumulation = 0;
    gPauseAt = undefined;
    gPauseAccumulation = 0;

    if (gRefreshAccumulationTimeout != undefined) {
      clearTimeout(gRefreshAccumulationTimeout);
    }

    $('#up-start').prop('disabled', false);
    $('#down-start').prop('disabled', false);

    console.log('STOP and RESET: done.');
    console.log('XXXXXXXXXXXXXXXXXXX');
  });

  