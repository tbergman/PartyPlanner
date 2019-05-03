import React from 'react';
import styled from '@emotion/styled';
import posed from 'react-pose';
import {
  FlexBoxFullCenteredStyles,
  TransparentButtonStyles
} from '@shared/styles';
import { useAudio } from '@hooks/useAudio';
import { Icon, Button, Typography, Slider, Tooltip } from 'antd';
import BigMusicPlayerUserControls from './BigMusicPlayerUserControls';
import useMedia from '@hooks/useMedia';
import BigMusicPlayerTrackInfo from './BigMusicPlayerTrackInfo';
import { debounce } from 'lodash';
import { SliderValue } from 'antd/lib/slider';

export const BIG_MUSIC_PLAYER_MOBILE_BREAKPOINT = 800;

const BigMusicPlayerWrapper = styled(
  posed.div({
    loading: {
      opacity: 0.2
    },
    loaded: {
      opacity: 1
    }
  })
)`
  width: 100%;
  height: 100%;
  ${FlexBoxFullCenteredStyles};
`;

const BottomInnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;

  @media screen and (max-width: ${BIG_MUSIC_PLAYER_MOBILE_BREAKPOINT}px) {
    padding: 0;
    flex-direction: column-reverse;
    width: 100%;
    max-width: 100%;
    height: 100%;
    justify-content: center;
  }
`;

const TransparentButton = styled.button`
  ${TransparentButtonStyles};
  margin-top: 6px;
  .anticon {
    font-size: 20px;
  }
`;

const ControlButtonsWrapper = styled.div`
  padding-bottom: 6px;
  ${FlexBoxFullCenteredStyles};
  button {
    .anticon {
      ${FlexBoxFullCenteredStyles};
    }
  }
  .play-pause-button {
    margin-left: 12px;
    margin-right: 12px;
    margin-top: 0 !important;
  }
  @media screen and (max-width: 800px) {
    .play-pause-button {
      margin-left: 4px;
      margin-right: 4px;
    }
    padding-bottom: 0;
    button {
      margin-top: 6px;
    }
  }
`;

const SliderWrapper = styled.div`
  display: grid;
  grid-template-columns: min-content 1fr min-content;
  align-items: center;

  width: 100%;
  .ant-slider-track {
    background: #66d26e;
  }

  .ant-slider-rail {
    background: #e1e1e1;
  }

  .ant-slider-handle {
    border: solid 2px #66d26e;
    &:focus {
      border-color: #48aa58;
    }
  }
  .ant-slider:hover {
    .ant-slider-track {
      background: #48aa58;
    }
  }
  .ant-slider {
    margin: 0;
    flex: 1;
  }
  & > span {
    font-size: 12px;
    display: inline-block;
    padding: 0 12px;
    font-feature-settings: 'tnum';
    font-variant-numeric: tabular-nums;
  }

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr min-content min-content;
    height: 36px;
    .ant-slider-dot {
      display: none;
    }

    & > span {
      grid-row: 2/3;
      padding: 0;
    }

    .ant-slider {
      grid-column: 1/3;
    }
  }
`;

const BigMusicPlayer: React.FC = () => {
  const isOnMobile = useMedia(
    `(max-width:${BIG_MUSIC_PLAYER_MOBILE_BREAKPOINT}px)`
  );
  // used when we want to ignore time update
  const latestDragValue = React.useRef<number>(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [ignoreStateTimeUpdate, setIgnoreStateTimeUpdate] = React.useState<
    boolean
  >(false);

  const {
    setTime,
    skip,
    toggle,
    state: { audioCurrentTime, audioDuration, loading, playing }
  } = useAudio(audioRef, false);

  const setTimeFuncRef = React.useRef<any>(setTime);

  React.useEffect(() => void (setTimeFuncRef.current = setTime), [setTime]);

  const debouncedAfterValueChange = React.useRef<(value: SliderValue) => void>(
    debounce((value: SliderValue) => {
      setIgnoreStateTimeUpdate(false);
      setTimeFuncRef.current({
        timeToSet: value as number,
        pauseOnSet: false,
        shouldIgnoreAudioElementTime: false
      });
    }, 150)
  );

  return (
    <BigMusicPlayerWrapper pose={loading ? 'loading' : 'loaded'}>
      {!isOnMobile && <BigMusicPlayerTrackInfo isOnMobile={isOnMobile} />}
      <BottomInnerWrapper>
        <ControlButtonsWrapper>
          {isOnMobile && <BigMusicPlayerTrackInfo isOnMobile={isOnMobile} />}
          <Tooltip title="Fast backwards by 5 seconds">
            <TransparentButton
              disabled={loading}
              onClick={() => skip(-5, !playing)}
            >
              <Icon type="fast-backward" />
            </TransparentButton>
          </Tooltip>
          <Button
            onClick={toggle}
            disabled={loading}
            icon={playing ? 'pause' : 'caret-right'}
            shape="circle"
            size={!isOnMobile ? 'large' : 'default'}
            className="play-pause-button"
          />
          <Tooltip trigger="hover" title="Fast forward by 5 seconds">
            <TransparentButton
              onClick={() => skip(5, !playing)}
              disabled={loading}
            >
              <Icon type="fast-forward" />
            </TransparentButton>
          </Tooltip>
          {isOnMobile && <BigMusicPlayerUserControls isOnMobile={isOnMobile} />}
        </ControlButtonsWrapper>
        <SliderWrapper>
          <audio
            src="https://p.scdn.co/mp3-preview/d7624ec5f93b6d92c1836a95c40ecce463584f6e?cid=774b29d4f13844c495f206cafdad9c86"
            ref={audioRef}
            controls={false}
            preload="auto"
          />
          {!isOnMobile && (
            <Typography.Text type="secondary">
              0:{getCurrentAudioTime()}
            </Typography.Text>
          )}

          <Slider
            onChange={updateAudioTimeState}
            defaultValue={0}
            disabled={loading}
            max={audioDuration}
            marks={isOnMobile ? getMobileSliderMarks() : undefined}
            tipFormatter={sliderTooltipFormatter}
            onAfterChange={debouncedAfterValueChange.current}
            value={
              ignoreStateTimeUpdate
                ? latestDragValue.current
                : audioCurrentTime.value
            }
          />
          {!isOnMobile && (
            <Typography.Text type="secondary">
              0:{audioDuration}
            </Typography.Text>
          )}
        </SliderWrapper>
      </BottomInnerWrapper>
      {!isOnMobile && <BigMusicPlayerUserControls isOnMobile={isOnMobile} />}
    </BigMusicPlayerWrapper>
  );

  function updateAudioTimeState(value: SliderValue) {
    if (!ignoreStateTimeUpdate) {
      setIgnoreStateTimeUpdate(true);
    }
    latestDragValue.current = value as number;
    setTime({
      timeToSet: value as number,
      pauseOnSet: false,
      shouldIgnoreAudioElementTime: true
    });
  }

  function getCurrentAudioTime() {
    return ignoreStateTimeUpdate
      ? formatNumberToAudioTime(latestDragValue.current)
      : formatNumberToAudioTime(audioCurrentTime.value);
  }

  function formatNumberToAudioTime(numberToFormat: number) {
    return numberToFormat < 10 ? `0${numberToFormat}` : numberToFormat;
  }

  function sliderTooltipFormatter(value: number) {
    return `${value}s`;
  }

  function getMobileSliderMarks() {
    return {
      0: {
        style: {
          transform: 'translate(0%, -20%)',
          color: 'rgba(0, 0, 0, 0.45)',
          fontSize: 11
        },
        label: `0:${getCurrentAudioTime()}`
      },
      30: {
        label: `0:${audioDuration}`,
        style: {
          color: 'rgba(0, 0, 0, 0.45)',
          fontSize: 11,
          transform: 'translate(-100%, -20%)'
        }
      }
    };
  }
};

export default BigMusicPlayer;
