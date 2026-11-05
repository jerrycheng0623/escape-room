import Foundation
import AVFoundation

let e = AVAudioEngine()
let piano = AVAudioUnitSampler()
e.attach(piano)
let format = AVAudioFormat(standardFormatWithSampleRate: 44100, channels: 2)!
e.connect(piano, to:e.mainMixerNode, format:format)
try piano.loadSoundBankInstrument(at:URL(fileURLWithPath:"/System/Library/Components/CoreAudio.component/Contents/Resources/gs_instruments.dls"), program:0, bankMSB:UInt8(kAUSampler_DefaultMelodicBankMSB), bankLSB:UInt8(kAUSampler_DefaultBankLSB))
try e.enableManualRenderingMode(.offline, format:format, maximumFrameCount:4096)
let s = AVAudioSequencer(audioEngine:e)
try s.load(from:URL(fileURLWithPath:CommandLine.arguments[1]), options:[])
for t in s.tracks { t.destinationAudioUnit = piano }
let duration = s.tracks.map(\.lengthInSeconds).max()! + 4
let f = try AVAudioFile(forWriting:URL(fileURLWithPath:CommandLine.arguments[2]), settings:format.settings)
let buffer = AVAudioPCMBuffer(pcmFormat:format,frameCapacity:4096)!
try e.start()
try s.start()
while e.manualRenderingSampleTime < AVAudioFramePosition(duration * format.sampleRate) {
  let frames = AVAudioFrameCount(min(Int64(buffer.frameCapacity), Int64(duration * format.sampleRate)-e.manualRenderingSampleTime))
  switch try e.renderOffline(frames,to:buffer) {
    case .success: try f.write(from:buffer)
    case .cannotDoInCurrentContext,.insufficientDataFromInputNode: continue
    case .error: fatalError("Audio render failed")
    @unknown default: fatalError("Unknown status")
  }
}
s.stop()
e.stop()
print(duration)
