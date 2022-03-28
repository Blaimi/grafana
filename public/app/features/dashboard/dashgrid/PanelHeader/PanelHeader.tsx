import React, { FC } from 'react';
import { css, cx } from '@emotion/css';
import {
  DataLink,
  GrafanaTheme2,
  PanelData,
  CSVConfig,
  DataFrame,
  DataTransformerID,
  dateTimeFormat,
  toCSV,
  applyRawFieldOverrides,
  applyFieldOverrides,
} from '@grafana/data';
import { Icon, useStyles2, Button } from '@grafana/ui';
import { selectors } from '@grafana/e2e-selectors';

import PanelHeaderCorner from './PanelHeaderCorner';
import { DashboardModel } from 'app/features/dashboard/state/DashboardModel';
import { PanelModel } from 'app/features/dashboard/state/PanelModel';
import { getPanelLinksSupplier } from 'app/features/panel/panellinks/linkSuppliers';
import { PanelHeaderNotices } from './PanelHeaderNotices';
import { PanelHeaderMenuTrigger } from './PanelHeaderMenuTrigger';
import { PanelHeaderLoadingIndicator } from './PanelHeaderLoadingIndicator';
import { PanelHeaderMenuWrapper } from './PanelHeaderMenuWrapper';
import { config } from '@grafana/runtime';

export interface Props {
  panel: PanelModel;
  dashboard: DashboardModel;
  title?: string;
  description?: string;
  links?: DataLink[];
  error?: string;
  alertState?: string;
  isViewing: boolean;
  isEditing: boolean;
  data: PanelData;
}

export const PanelHeader: FC<Props> = ({ panel, error, isViewing, isEditing, data, alertState, dashboard }) => {
  const dataFrameIndex = 0;
  let transformId: DataTransformerID = DataTransformerID.noop;
  const dataOptions = {
    withTransforms: (config as any).formattedData || false,
    withFieldConfig: (config as any).applyPanelTransformation || true,
  };
  const dataFrames = getProcessedData();

  function getProcessedData(): DataFrame[] {
    const timeZone = dashboard.timezone;

    if (!dataOptions.withFieldConfig || !panel) {
      return applyRawFieldOverrides((data && data.series) || []);
    }

    // We need to apply field config even though it was already applied in the PanelQueryRunner.
    // That's because transformers create new fields and data frames, so i.e. display processor is no longer there
    return applyFieldOverrides({
      data: data.series,
      theme: config.theme2,
      fieldConfig: panel.fieldConfig,
      timeZone,
      replaceVariables: (value: string) => {
        return value;
      },
    });
  }
  const onCancelQuery = () => panel.getQueryRunner().cancelQuery();
  const title = panel.getDisplayTitle();
  const className = cx('panel-header', !(isViewing || isEditing) ? 'grid-drag-handle' : '');
  const styles = useStyles2(panelStyles);

  const exportCsv = (dataFrame: DataFrame, csvConfig: CSVConfig = {}, panel: PanelModel): void => {
    const dataFrameCsv = toCSV([dataFrame], csvConfig);

    const blob = new Blob([String.fromCharCode(0xfeff), dataFrameCsv], {
      type: 'text/csv;charset=utf-8',
    });
    const displayTitle = panel ? panel.getDisplayTitle() : 'Explore';
    const transformation = transformId !== DataTransformerID.noop ? '-as-' + transformId.toLocaleLowerCase() : '';
    const fileName = `${displayTitle}-data${transformation}-${dateTimeFormat(new Date())}.csv`;
    saveAs(blob, fileName);
  };

  return (
    <>
      <PanelHeaderLoadingIndicator state={data.state} onClick={onCancelQuery} />
      <PanelHeaderCorner
        panel={panel}
        title={panel.title}
        description={panel.description}
        scopedVars={panel.scopedVars}
        links={getPanelLinksSupplier(panel)}
        error={error}
      />
      <div className={className}>
        <PanelHeaderMenuTrigger data-testid={selectors.components.Panels.Panel.title(title)}>
          {({ closeMenu, panelMenuOpen }) => {
            return (
              <div className="panel-title">
                <PanelHeaderNotices frames={data.series} panelId={panel.id} />
                {alertState ? (
                  <Icon
                    name={alertState === 'alerting' ? 'heart-break' : 'heart'}
                    className="icon-gf panel-alert-icon"
                    style={{ marginRight: '4px' }}
                    size="sm"
                  />
                ) : null}
                <h2 className={styles.titleText}>{title}</h2>
                <Icon name="angle-down" className="panel-menu-toggle" />
                {dataFrames.length === 1 && panel.exportcsv && (
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => {
                      exportCsv(
                        dataFrames[dataFrameIndex],
                        {
                          delimiter: (config as any).csvDelimiter || ',',
                          useExcelHeader: (config as any).downloadForExcel || false,
                        },
                        panel
                      );
                    }}
                    className={css`
                      margin-bottom: 5px;
                      font-size: 10px;
                      margin-left: 20px;
                    `}
                  >
                    Download CSV
                  </Button>
                )}

                <PanelHeaderMenuWrapper panel={panel} dashboard={dashboard} show={panelMenuOpen} onClose={closeMenu} />
                {data.request && data.request.timeInfo && (
                  <span className="panel-time-info">
                    <Icon name="clock-nine" size="sm" /> {data.request.timeInfo}
                  </span>
                )}
              </div>
            );
          }}
        </PanelHeaderMenuTrigger>
      </div>
    </>
  );
};

const panelStyles = (theme: GrafanaTheme2) => {
  return {
    titleText: css`
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      max-width: calc(100% - 38px);
      cursor: pointer;
      font-weight: ${theme.typography.fontWeightMedium};
      font-size: ${theme.typography.body.fontSize};
      margin: 0;

      &:hover {
        color: ${theme.colors.text.primary};
      }
      .panel-has-alert & {
        max-width: calc(100% - 54px);
      }
    `,
  };
};
