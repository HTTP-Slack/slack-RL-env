import Preferences from '../../models/preferences/preferences.model.js';
import AudioVideoPreferences from '../../models/preferences/audioVideoPreferences.model.js';

// @desc    get user's audio & video preferences
// @route   GET /api/preferences/audio-video
// @access  Private
export const getAudioVideoPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get audio & video preferences
    let audioVideoPrefs = null;
    if (userPreferences.audioVideo) {
      audioVideoPrefs = await AudioVideoPreferences.findById(userPreferences.audioVideo);
    }

    // If audio & video preferences don't exist, return defaults
    if (!audioVideoPrefs) {
      audioVideoPrefs = await AudioVideoPreferences.create({
        microphoneDevice: 'default',
        speakerDevice: 'default',
        cameraDevice: 'default',
        setStatusToInHuddle: true,
        muteMicrophoneOnJoin: false,
        autoTurnOnCaptions: false,
        warnLargeChannel: true,
        blurVideoBackground: false,
        playMusic: true,
        musicStartDelay: '1 minute',
      });
      userPreferences.audioVideo = audioVideoPrefs._id;
      await userPreferences.save();
    }

    res.status(200).json({
      success: true,
      data: audioVideoPrefs,
    });
  } catch (error) {
    console.log('Error in getAudioVideoPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update user's audio & video preferences
// @route   PATCH /api/preferences/audio-video
// @access  Private
/*
  body {
    microphoneDevice (optional),
    speakerDevice (optional),
    cameraDevice (optional),
    setStatusToInHuddle (optional),
    muteMicrophoneOnJoin (optional),
    autoTurnOnCaptions (optional),
    warnLargeChannel (optional),
    blurVideoBackground (optional),
    playMusic (optional),
    musicStartDelay (optional)
  }
*/
export const updateAudioVideoPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get or create audio & video preferences
    let audioVideoPrefs = null;
    if (userPreferences.audioVideo) {
      audioVideoPrefs = await AudioVideoPreferences.findById(userPreferences.audioVideo);
    }

    if (!audioVideoPrefs) {
      // Create with defaults and merge with update data
      audioVideoPrefs = await AudioVideoPreferences.create({
        microphoneDevice: 'default',
        speakerDevice: 'default',
        cameraDevice: 'default',
        setStatusToInHuddle: true,
        muteMicrophoneOnJoin: false,
        autoTurnOnCaptions: false,
        warnLargeChannel: true,
        blurVideoBackground: false,
        playMusic: true,
        musicStartDelay: '1 minute',
        ...updateData,
      });
      userPreferences.audioVideo = audioVideoPrefs._id;
      await userPreferences.save();
    } else {
      // Update existing preferences (only update provided fields)
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          audioVideoPrefs[key] = updateData[key];
        }
      });
      await audioVideoPrefs.save();
    }

    res.status(200).json({
      success: true,
      data: audioVideoPrefs,
    });
  } catch (error) {
    console.log('Error in updateAudioVideoPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    create audio & video preferences for user
// @route   POST /api/preferences/audio-video
// @access  Private
/*
  body {
    microphoneDevice (optional),
    speakerDevice (optional),
    cameraDevice (optional)
  }
*/
export const createAudioVideoPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { microphoneDevice, speakerDevice, cameraDevice } = req.body;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Check if audio & video preferences already exist
    if (userPreferences.audioVideo) {
      return res.status(400).json({
        success: false,
        message: 'Audio & video preferences already exist. Use PATCH to update.',
      });
    }

    // Create audio & video preferences
    const audioVideoPrefs = await AudioVideoPreferences.create({
      microphoneDevice: microphoneDevice ?? 'default',
      speakerDevice: speakerDevice ?? 'default',
      cameraDevice: cameraDevice ?? 'default',
      setStatusToInHuddle: setStatusToInHuddle ?? true,
      muteMicrophoneOnJoin: muteMicrophoneOnJoin ?? false,
      autoTurnOnCaptions: autoTurnOnCaptions ?? false,
      warnLargeChannel: warnLargeChannel ?? true,
      blurVideoBackground: blurVideoBackground ?? false,
      playMusic: playMusic ?? true,
      musicStartDelay: musicStartDelay ?? '1 minute',
    });

    // Link to user preferences
    userPreferences.audioVideo = audioVideoPrefs._id;
    await userPreferences.save();

    res.status(201).json({
      success: true,
      data: audioVideoPrefs,
    });
  } catch (error) {
    console.log('Error in createAudioVideoPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

