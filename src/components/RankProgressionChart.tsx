import React, { useState } from 'react';
import { Match, Team } from '../types/league';
import { computeRankTimeline } from '../utils/calculations';

interface RankProgressionChartProps {
  teams: Team[];
  matches: Match[];
  divisionId: string;
  divisionName: string;
  starredTeam: string | null;
}

export const RankProgressionChart: React.FC<RankProgressionChartProps> = ({
  teams,
  matches,
  divisionId,
  divisionName,
  starredTeam,
}) => {
  const { gameweeks, teamPaths } = computeRankTimeline(teams, matches, divisionId);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{
    teamName: string;
    gameweek: number;
    rank: number;
    x: number;
    y: number;
  } | null>(null);

  const activeHighlightId =
    selectedTeamId || (starredTeam ? teamPaths.find((t) => t.teamName === starredTeam)?.teamId : null);

  if (gameweeks.length < 2 || teamPaths.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 text-center text-slate-400 text-xs">
        Rank trajectory will plot once at least two matchweeks are complete.
      </div>
    );
  }

  const width = 800;
  const height = 280;
  const paddingLeft = 40;
  const paddingRight = 130;
  const paddingTop = 16;
  const paddingBottom = 26;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const numTeams = teamPaths.length;

  const getX = (gwIndex: number) => {
    if (gameweeks.length === 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (gwIndex / (gameweeks.length - 1)) * chartWidth;
  };

  const getY = (rank: number) => {
    return paddingTop + ((rank - 1) / (numTeams - 1 || 1)) * chartHeight;
  };

  return (
    <div className="bg-[#0a1526] text-white rounded-xl border border-[#162744] p-4 sm:p-5 space-y-3 shadow-xs">
      {/* Chart Topline */}
      <div className="flex items-center justify-between text-xs pb-2.5 border-b border-[#162744]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
          <span className="font-semibold text-white uppercase tracking-wider text-xs">
            {divisionName} Table Progression
          </span>
        </div>
        <span className="text-emerald-400 font-mono text-[11px] font-medium">
          GW 1–{gameweeks[gameweeks.length - 1]}
        </span>
      </div>

      {/* SVG Bump Chart Viewport */}
      <div className="relative w-full overflow-x-auto custom-scrollbar">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[650px] h-auto select-none"
        >
          {/* Horizontal Rank Lines */}
          {Array.from({ length: numTeams }).map((_, idx) => {
            const rank = idx + 1;
            const y = getY(rank);
            const isEighthCutoff = rank === 8;

            return (
              <g key={rank}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={paddingLeft + chartWidth}
                  y2={y}
                  stroke={isEighthCutoff ? '#10B981' : '#14253f'}
                  strokeWidth={isEighthCutoff ? 1.25 : 0.75}
                  strokeDasharray={isEighthCutoff ? '4,4' : 'none'}
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] font-mono tabular-nums fill-slate-400"
                >
                  {rank}
                </text>
              </g>
            );
          })}

          {/* Vertical Gameweek Axis */}
          {gameweeks.map((gw, idx) => {
            const x = getX(idx);
            return (
              <g key={gw}>
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-slate-400 uppercase font-medium"
                >
                  W{gw}
                </text>
              </g>
            );
          })}

          {/* Team Trajectory Curves */}
          {teamPaths.map((tp) => {
            const isHighlighted = activeHighlightId === tp.teamId;
            const isAnyHighlighted = activeHighlightId !== null;
            const opacity = isAnyHighlighted ? (isHighlighted ? 1 : 0.15) : 0.85;
            const strokeWidth = isHighlighted ? 3 : 1.75;

            const points: { x: number; y: number; rank: number; gw: number }[] = [];
            tp.ranks.forEach((rank, idx) => {
              if (rank !== null) {
                points.push({
                  x: getX(idx),
                  y: getY(rank),
                  rank,
                  gw: gameweeks[idx],
                });
              }
            });

            if (points.length < 2) return null;

            let pathD = `M ${points[0].x} ${points[0].y}`;
            for (let i = 0; i < points.length - 1; i++) {
              const p0 = points[i];
              const p1 = points[i + 1];
              const cpX = (p0.x + p1.x) / 2;
              pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
            }

            const lastPoint = points[points.length - 1];

            return (
              <g key={tp.teamId} className="transition-opacity duration-150">
                <path
                  d={pathD}
                  fill="none"
                  stroke={tp.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={opacity}
                  className="cursor-pointer"
                  onClick={() => setSelectedTeamId(activeHighlightId === tp.teamId ? null : tp.teamId)}
                />

                {points.map((pt) => (
                  <circle
                    key={pt.gw}
                    cx={pt.x}
                    cy={pt.y}
                    r={isHighlighted ? 4 : 2.5}
                    fill={tp.color}
                    opacity={opacity}
                    className="cursor-pointer"
                    onMouseEnter={() =>
                      setHoveredNode({
                        teamName: tp.teamName,
                        gameweek: pt.gw,
                        rank: pt.rank,
                        x: pt.x,
                        y: pt.y,
                      })
                    }
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => setSelectedTeamId(activeHighlightId === tp.teamId ? null : tp.teamId)}
                  />
                ))}

                {lastPoint && (
                  <text
                    x={lastPoint.x + 8}
                    y={lastPoint.y + 3.5}
                    className={`text-[10px] cursor-pointer transition-colors ${
                      isHighlighted ? 'fill-emerald-400 font-semibold' : 'fill-slate-300'
                    }`}
                    opacity={isAnyHighlighted ? (isHighlighted ? 1 : 0.3) : 0.9}
                    onClick={() => setSelectedTeamId(activeHighlightId === tp.teamId ? null : tp.teamId)}
                  >
                    {tp.teamName}
                  </text>
                )}
              </g>
            );
          })}

          {/* Minimal Tooltip */}
          {hoveredNode && (
            <g transform={`translate(${hoveredNode.x}, ${hoveredNode.y - 8})`}>
              <rect
                x="-44"
                y="-20"
                width="88"
                height="18"
                rx="4"
                fill="#071222"
                stroke="#10B981"
                strokeWidth="1"
              />
              <text
                x="0"
                y="-7"
                textAnchor="middle"
                fill="#FFFFFF"
                className="text-[9px] font-mono font-medium"
              >
                W{hoveredNode.gameweek}: #{hoveredNode.rank}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
