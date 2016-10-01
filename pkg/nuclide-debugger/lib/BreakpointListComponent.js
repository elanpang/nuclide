'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type DebuggerActions from './DebuggerActions';

import {React} from 'react-for-atom';
import invariant from 'assert';
import nuclideUri from '../../commons-node/nuclideUri';
import {Checkbox} from '../../nuclide-ui/Checkbox';
import {Listview} from '../../nuclide-ui/ListView';
import type {FileLineBreakpoints, FileLineBreakpoint} from './types';

type BreakpointListComponentProps = {
  actions: DebuggerActions,
  breakpoints: ?FileLineBreakpoints,
};

export class BreakpointListComponent extends React.Component {
  props: BreakpointListComponentProps;

  constructor(props: BreakpointListComponentProps) {
    super(props);
    (this: any)._handleBreakpointEnabledChange = this._handleBreakpointEnabledChange.bind(this);
    (this: any)._handleBreakpointClick = this._handleBreakpointClick.bind(this);
  }

  _handleBreakpointEnabledChange(breakpoint: FileLineBreakpoint, enabled: boolean): void {
    this.props.actions.updateBreakpointEnabled(breakpoint.id, enabled);
  }

  _handleBreakpointClick(breakpointIndex: number, event: SyntheticMouseEvent): void {
    const {breakpoints} = this.props;
    invariant(breakpoints != null);
    const {
      path,
      line,
    } = breakpoints[breakpointIndex];
    this.props.actions.openSourceLocation(nuclideUri.nuclideUriToUri(path), line);
  }

  render(): ?React.Element<any> {
    const {breakpoints} = this.props;
    if (breakpoints == null || breakpoints.length === 0) {
      return <span>(no breakpoints)</span>;
    }
    const renderedBreakpoints = breakpoints
      // Show resolved breakpoints at the top of the list
      .sort((breakpointA, breakpointB) =>
        Number(breakpointB.resolved) - Number(breakpointA.resolved))
      .map((breakpoint, i) => {
        const {
          path,
          line,
          enabled,
          resolved,
        } = breakpoint;
        const label = `${nuclideUri.basename(path)}:${line + 1}`;
        return (
          <div className="nuclide-debugger-breakpoint" key={i}>
            <Checkbox
              label={label}
              checked={enabled}
              indeterminate={!resolved}
              disabled={!resolved}
              onChange={this._handleBreakpointEnabledChange.bind(this, breakpoint)}
              title={resolved ? null : 'Unresolved Breakpoint'}
            />
          </div>
        );
      });
    return (
      <Listview
        alternateBackground={true}
        onSelect={this._handleBreakpointClick}
        selectable={true}>
        {renderedBreakpoints}
      </Listview>
    );
  }
}
