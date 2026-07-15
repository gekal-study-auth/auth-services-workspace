"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import type { Protocol } from "../lib/protocols";

type FlowStyle = CSSProperties & { "--start": number; "--width": number; "--reverse": number };

export function AnimatedFlowDiagram({ protocol }: { protocol: Protocol }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const step = protocol.steps[active];
  const choose = (index: number) => {
    setActive(index);
    setPlaying(false);
  };

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setActive((value) => (value + 1) % protocol.steps.length),
      2600,
    );
    return () => window.clearInterval(timer);
  }, [playing, protocol.steps.length]);

  return (
    <div className={`animatedFlow ${protocol.accent}`}>
      <div className="flowToolbar">
        <div>
          <span className="liveIndicator" /> Interactive sequence
        </div>
        <button type="button" onClick={() => setPlaying((value) => !value)}>
          {playing ? "Pause Ⅱ" : "Play ▶"}
        </button>
      </div>
      <div className="sequenceViewport">
        <div className="sequenceCanvas">
          <div className="actorRow">
            {protocol.actors.map((actor) => (
              <div className="sequenceActor" key={actor.id}>
                <span>{actor.name[0]}</span>
                <strong>{actor.name}</strong>
                <small>{actor.detail}</small>
              </div>
            ))}
          </div>
          <div className="lifelines" aria-hidden="true">
            {protocol.actors.map((actor) => (
              <i key={actor.id} />
            ))}
          </div>
          <div className="messageRows">
            {protocol.steps.map((item, index) => {
              const from = protocol.actors.findIndex((actor) => actor.id === item.from);
              const to = protocol.actors.findIndex((actor) => actor.id === item.to);
              const style: FlowStyle = {
                "--start": Math.min(from, to),
                "--width": Math.max(Math.abs(to - from), 0.24),
                "--reverse": to < from ? 1 : 0,
              };
              return (
                <button
                  className={`messageRow ${index === active ? "isActive" : ""}`}
                  key={`${item.label}-${index}`}
                  onClick={() => choose(index)}
                  style={style}
                  type="button"
                  aria-label={`ステップ${index + 1}: ${item.label}`}
                >
                  <span className="messageIndex">{String(index + 1).padStart(2, "0")}</span>
                  <span className="messageLine">
                    <i className="packet" />
                  </span>
                  <span className="messageLabel">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="activeExplanation" key={active}>
        <div className="explanationNumber">{String(active + 1).padStart(2, "0")}</div>
        <div className="explanationCopy">
          <p>
            {protocol.actors.find((actor) => actor.id === step.from)?.name} →{" "}
            {protocol.actors.find((actor) => actor.id === step.to)?.name}
          </p>
          <h2>{step.label}</h2>
          <p>{step.detail}</p>
        </div>
        <div className="messageSample">
          <small>MESSAGE</small>
          <code>{step.message}</code>
          <small>SECURITY</small>
          <p>{step.security}</p>
        </div>
      </div>
      <div
        className="flowProgress"
        aria-label={`全${protocol.steps.length}ステップ中${active + 1}`}
      >
        {protocol.steps.map((item, index) => (
          <button
            key={item.label}
            type="button"
            className={index === active ? "isActive" : ""}
            onClick={() => choose(index)}
            aria-label={`ステップ${index + 1}`}
          >
            <i />
          </button>
        ))}
      </div>
    </div>
  );
}
