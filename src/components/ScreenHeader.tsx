import type { ReactNode } from 'react';
import { Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export function ScreenHeader({ title, subtitle, right }: Props) {
  return (
    <SafeAreaView edges={['top']} style={outer}>
      <View style={container}>
        <View style={{ flex: 1 }}>
          <Text style={titleStyle}>{title}</Text>
          {subtitle ? <Text style={subtitleStyle}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={rightStyle}>{right}</View> : null}
      </View>
    </SafeAreaView>
  );
}

const outer: ViewStyle = {
  backgroundColor: '#0b1224',
  borderBottomWidth: 1,
  borderBottomColor: '#1f2937'
};

const container: ViewStyle = {
  paddingHorizontal: 18,
  paddingTop: 12,
  paddingBottom: 12,
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: 12
};

const rightStyle: ViewStyle = {
  justifyContent: 'flex-end'
};

const titleStyle: TextStyle = {
  color: 'white',
  fontSize: 20,
  fontWeight: '900'
};

const subtitleStyle: TextStyle = {
  color: '#94a3b8',
  fontSize: 12,
  marginTop: 4
};
