import type { ReactNode } from 'react';
import { Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme/useAppTheme';

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export function ScreenHeader({ title, subtitle, right }: Props) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView edges={['top']} style={[outer, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
      <View style={container}>
        <View style={{ flex: 1 }}>
          <Text style={[titleStyle, { color: colors.text }]}>{title}</Text>
          {subtitle ? <Text style={[subtitleStyle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={rightStyle}>{right}</View> : null}
      </View>
    </SafeAreaView>
  );
}

const outer: ViewStyle = {
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
  fontSize: 20,
  fontWeight: '900'
};

const subtitleStyle: TextStyle = {
  fontSize: 12,
  marginTop: 4
};
