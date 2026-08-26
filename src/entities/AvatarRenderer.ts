export interface AvatarCustomization {
  skinColor: string;
  gender?: 'm' | 'f' | 'all';
  hair: {
    id: string;
    style: string;
    primaryColor: string;
    secondaryColor: string;
  };
  face: {
    id: string;
    style: string;
    eyeColor: string;
    expression: string;
  };
  top: {
    id: string;
    style: string;
    primaryColor: string;
    secondaryColor: string;
    detailColor?: string;
  };
  bottom: {
    id: string;
    style: string;
    primaryColor: string;
    secondaryColor: string;
  };
  shoes: {
    id: string;
    style: string;
    primaryColor: string;
    secondaryColor: string;
  };
  headAccessory?: {
    id: string;
    style: string;
    primaryColor: string;
    secondaryColor: string;
  };
  backAccessory?: {
    id: string;
    style: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

export type Direction = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7; // 0=SE, 1=S, 2=SW, 3=W, 4=NW, 5=N, 6=NE, 7=E
export type AvatarAnimation = 'idle' | 'walk' | 'sit' | 'dance' | 'wave' | 'pose' | 'cry' | 'laugh';

export class AvatarRenderer {
  public static drawAvatar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    customization: AvatarCustomization,
    direction: Direction = 0,
    animation: AvatarAnimation = 'idle',
    animFrame: number = 0,
    scale: number = 1.0
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Animation physics & easing
    let bodyBob = 0;
    let headBob = 0;
    let leftLegAngle = 0;
    let rightLegAngle = 0;
    let leftArmAngle = 0;
    let rightArmAngle = 0;
    let isSitting = animation === 'sit';

    if (animation === 'idle') {
      bodyBob = Math.sin(animFrame * 0.08) * 1.5;
      headBob = Math.sin(animFrame * 0.08 - 0.4) * 1.8;
      leftArmAngle = Math.sin(animFrame * 0.08) * 0.08;
      rightArmAngle = -Math.sin(animFrame * 0.08) * 0.08;
    } else if (animation === 'walk') {
      const stepPhase = animFrame * 0.25;
      bodyBob = Math.abs(Math.sin(stepPhase)) * 3.5;
      headBob = Math.sin(stepPhase) * 2;
      leftLegAngle = Math.sin(stepPhase) * 0.55;
      rightLegAngle = -Math.sin(stepPhase) * 0.55;
      leftArmAngle = -Math.sin(stepPhase) * 0.5;
      rightArmAngle = Math.sin(stepPhase) * 0.5;
    } else if (animation === 'dance') {
      const dancePhase = animFrame * 0.2;
      bodyBob = Math.abs(Math.sin(dancePhase)) * 6;
      headBob = Math.sin(dancePhase * 2) * 2.5;
      leftArmAngle = Math.sin(dancePhase) * 0.9 - 0.6;
      rightArmAngle = -Math.sin(dancePhase) * 0.9 + 0.6;
      leftLegAngle = Math.sin(dancePhase) * 0.25;
      rightLegAngle = -Math.sin(dancePhase) * 0.25;
    } else if (animation === 'wave') {
      bodyBob = Math.sin(animFrame * 0.08) * 1.2;
      rightArmAngle = -1.7 + Math.sin(animFrame * 0.35) * 0.45;
      leftArmAngle = 0.1;
    } else if (animation === 'pose') {
      bodyBob = 0;
      headBob = -1.5;
      leftArmAngle = 0.6;
      rightArmAngle = -0.75;
      rightLegAngle = 0.2;
    } else if (animation === 'cry') {
      bodyBob = Math.sin(animFrame * 0.22) * 2.5;
      headBob = 3.5;
      leftArmAngle = 0.4;
      rightArmAngle = 0.4;
    } else if (animation === 'laugh') {
      bodyBob = Math.abs(Math.sin(animFrame * 0.35)) * 3.5;
      headBob = -4;
      leftArmAngle = -0.3;
      rightArmAngle = -0.3;
    }

    const isBackFacing = direction === 4 || direction === 5 || direction === 6;
    const isProfile = direction === 2 || direction === 3 || direction === 6 || direction === 7;
    const flipX = direction === 2 || direction === 3 || direction === 4 ? -1 : 1;

    ctx.scale(flipX, 1);

    // 1. Soft Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Back Accessory (Wings, Capes, Guitars)
    if (customization.backAccessory) {
      this.drawBackAccessory(ctx, customization.backAccessory, bodyBob, animFrame);
    }

    // 3. Back Hair (Behind shoulders)
    if (!isBackFacing) {
      this.drawBackHair(ctx, customization.hair, bodyBob + headBob);
    }

    // 4. Legs & Shoes
    this.drawLegsAndShoes(ctx, customization, isSitting, leftLegAngle, rightLegAngle, bodyBob);

    // 5. Torso & Clothes
    this.drawTorso(ctx, customization, bodyBob, isBackFacing);

    // 6. Arms & Hands
    this.drawArms(ctx, customization, bodyBob, leftArmAngle, rightArmAngle, isBackFacing);

    // 7. Head & Detailed Face
    this.drawHead(ctx, customization, bodyBob + headBob, isBackFacing, isProfile, animation, animFrame);

    // 8. Front Hair & Head Accessories
    this.drawFrontHair(ctx, customization.hair, bodyBob + headBob, isBackFacing);
    if (customization.headAccessory) {
      this.drawHeadAccessory(ctx, customization.headAccessory, bodyBob + headBob, isBackFacing);
    }

    // 9. Particle Emotes
    if (animation === 'cry') {
      this.drawTears(ctx, bodyBob + headBob, animFrame);
    } else if (animation === 'dance') {
      this.drawMusicalNotes(ctx, bodyBob, animFrame);
    }

    ctx.restore();
  }

  private static drawBackAccessory(
    ctx: CanvasRenderingContext2D,
    acc: { style: string; primaryColor: string; secondaryColor: string },
    bodyBob: number,
    frame: number
  ) {
    ctx.save();
    ctx.translate(0, -42 + bodyBob);

    if (acc.style === 'fairy_wings' || acc.style === 'demon_wings') {
      const flap = Math.sin(frame * 0.18) * 0.15;
      ctx.fillStyle = acc.primaryColor;
      ctx.globalAlpha = 0.88;

      // Left wing
      ctx.save();
      ctx.rotate(-0.2 + flap);
      ctx.beginPath();
      ctx.moveTo(-6, -4);
      ctx.bezierCurveTo(-28, -36, -42, -12, -32, 16);
      ctx.bezierCurveTo(-22, 26, -10, 12, -6, 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = acc.secondaryColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Right wing
      ctx.save();
      ctx.rotate(0.2 - flap);
      ctx.beginPath();
      ctx.moveTo(6, -4);
      ctx.bezierCurveTo(28, -36, 42, -12, 32, 16);
      ctx.bezierCurveTo(22, 26, 10, 12, 6, 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = acc.secondaryColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  private static drawBackHair(
    ctx: CanvasRenderingContext2D,
    hair: { style: string; primaryColor: string; secondaryColor: string },
    headBob: number
  ) {
    ctx.save();
    ctx.translate(0, -50 + headBob);
    ctx.fillStyle = hair.primaryColor;

    if (hair.style === 'glam_waves' || hair.style === 'long_straight') {
      ctx.beginPath();
      ctx.moveTo(-18, -12);
      ctx.bezierCurveTo(-28, 16, -24, 38, -14, 44);
      ctx.bezierCurveTo(0, 46, 14, 44, 24, 38);
      ctx.bezierCurveTo(28, 16, 18, -12, 18, -12);
      ctx.closePath();
      ctx.fill();

      // Hair shading & stroke
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  private static drawLegsAndShoes(
    ctx: CanvasRenderingContext2D,
    cust: AvatarCustomization,
    isSitting: boolean,
    leftAngle: number,
    rightAngle: number,
    bodyBob: number
  ) {
    ctx.save();
    ctx.translate(0, -28 + bodyBob);

    if (isSitting) {
      // Sitting legs folded forward
      ctx.fillStyle = cust.bottom.primaryColor;
      ctx.beginPath();
      ctx.roundRect(-9, 2, 18, 14, 5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.stroke();

      // Shoes forward
      ctx.fillStyle = cust.shoes.primaryColor;
      ctx.beginPath();
      ctx.roundRect(-10, 14, 20, 10, 4);
      ctx.fill();
      ctx.fillStyle = cust.shoes.secondaryColor;
      ctx.fillRect(-10, 20, 20, 4);
      ctx.restore();
      return;
    }

    // Left Leg
    ctx.save();
    ctx.translate(-5.5, 0);
    ctx.rotate(leftAngle);
    // Pants
    ctx.fillStyle = cust.bottom.primaryColor;
    ctx.beginPath();
    ctx.roundRect(-3.5, 0, 7, 20, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.stroke();

    // Ripped jeans detail or stitching
    if (cust.bottom.style.includes('ripped') && cust.bottom.secondaryColor) {
      ctx.fillStyle = cust.bottom.secondaryColor;
      ctx.fillRect(-2, 7, 4, 2);
      ctx.fillRect(-2, 12, 4, 2);
    }

    // Shoe / Sneaker
    ctx.fillStyle = cust.shoes.primaryColor;
    ctx.beginPath();
    ctx.roundRect(-4.5, 18, 9, 10, 4);
    ctx.fill();
    ctx.fillStyle = cust.shoes.secondaryColor;
    ctx.fillRect(-4.5, 24, 9, 4);
    ctx.restore();

    // Right Leg
    ctx.save();
    ctx.translate(5.5, 0);
    ctx.rotate(rightAngle);
    // Pants
    ctx.fillStyle = cust.bottom.primaryColor;
    ctx.beginPath();
    ctx.roundRect(-3.5, 0, 7, 20, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.stroke();

    if (cust.bottom.style.includes('ripped') && cust.bottom.secondaryColor) {
      ctx.fillStyle = cust.bottom.secondaryColor;
      ctx.fillRect(-2, 7, 4, 2);
      ctx.fillRect(-2, 12, 4, 2);
    }

    // Shoe / Sneaker
    ctx.fillStyle = cust.shoes.primaryColor;
    ctx.beginPath();
    ctx.roundRect(-4.5, 18, 9, 10, 4);
    ctx.fill();
    ctx.fillStyle = cust.shoes.secondaryColor;
    ctx.fillRect(-4.5, 24, 9, 4);
    ctx.restore();

    ctx.restore();
  }

  private static drawTorso(
    ctx: CanvasRenderingContext2D,
    cust: AvatarCustomization,
    bodyBob: number,
    isBackFacing: boolean
  ) {
    ctx.save();
    ctx.translate(0, -46 + bodyBob);

    // Neck
    ctx.fillStyle = cust.skinColor;
    ctx.fillRect(-3.5, -2, 7, 7);

    // Torso Shirt Body
    ctx.fillStyle = cust.top.primaryColor;
    ctx.beginPath();
    ctx.roundRect(-11, 3, 22, 20, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Shirt details / graphics / collar
    if (!isBackFacing && cust.top.secondaryColor) {
      ctx.fillStyle = cust.top.secondaryColor;
      if (cust.top.style.includes('hoodie') || cust.top.style.includes('graphic')) {
        // Woozworld star graphic on chest
        ctx.beginPath();
        ctx.arc(0, 11, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = cust.top.detailColor || '#ffffff';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★', 0, 13.5);
      } else if (cust.top.style.includes('corset') || cust.top.style.includes('blazer')) {
        ctx.fillRect(-4, 3, 8, 20);
      }
    }

    // Belt / Waistband
    ctx.fillStyle = cust.bottom.secondaryColor || 'rgba(0,0,0,0.3)';
    ctx.fillRect(-11, 20, 22, 3.5);

    ctx.restore();
  }

  private static drawArms(
    ctx: CanvasRenderingContext2D,
    cust: AvatarCustomization,
    bodyBob: number,
    leftAngle: number,
    rightAngle: number,
    isBackFacing: boolean
  ) {
    ctx.save();
    ctx.translate(0, -44 + bodyBob);

    // Left Arm
    ctx.save();
    ctx.translate(-11, 4);
    ctx.rotate(leftAngle);
    // Sleeve
    ctx.fillStyle = cust.top.primaryColor;
    ctx.fillRect(-3, 0, 6, 9);
    // Forearm & Hand
    ctx.fillStyle = cust.skinColor;
    ctx.fillRect(-2.5, 9, 5, 11);
    ctx.beginPath();
    ctx.arc(0, 20, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right Arm
    ctx.save();
    ctx.translate(11, 4);
    ctx.rotate(rightAngle);
    // Sleeve
    ctx.fillStyle = cust.top.primaryColor;
    ctx.fillRect(-3, 0, 6, 9);
    // Forearm & Hand
    ctx.fillStyle = cust.skinColor;
    ctx.fillRect(-2.5, 9, 5, 11);
    ctx.beginPath();
    ctx.arc(0, 20, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  private static drawHead(
    ctx: CanvasRenderingContext2D,
    cust: AvatarCustomization,
    headBob: number,
    isBackFacing: boolean,
    isProfile: boolean,
    animation: AvatarAnimation,
    frame: number
  ) {
    ctx.save();
    ctx.translate(0, -62 + headBob);

    // Head oval base
    ctx.fillStyle = cust.skinColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.stroke();

    if (isBackFacing) {
      ctx.restore();
      return;
    }

    // Blush cheeks
    ctx.fillStyle = 'rgba(255, 64, 129, 0.32)';
    ctx.beginPath();
    ctx.ellipse(-8, 4, 3.5, 2.2, 0, 0, Math.PI * 2);
    ctx.ellipse(8, 4, 3.5, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyelashes & Brows
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(-6, -6, 4, Math.PI * 0.9, Math.PI * 1.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(6, -6, 4, Math.PI * 1.1, Math.PI * 0.1);
    ctx.stroke();

    // Eyes
    const eyeOffset = isProfile ? 2 : 0;
    const isBlinking = frame % 100 > 95;

    if (isBlinking || animation === 'laugh') {
      ctx.strokeStyle = '#212121';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-6 + eyeOffset, 0, 3.5, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(6 + eyeOffset, 0, 3.5, Math.PI, 0);
      ctx.stroke();
    } else {
      // Classic stylized anime/Flash eyes with double highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-6 + eyeOffset, 0, 4, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(6 + eyeOffset, 0, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iris
      ctx.fillStyle = cust.face.eyeColor || '#00bcd4';
      ctx.beginPath();
      ctx.arc(-6 + eyeOffset, 0, 3, 0, Math.PI * 2);
      ctx.arc(6 + eyeOffset, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(-6 + eyeOffset, 0, 1.8, 0, Math.PI * 2);
      ctx.arc(6 + eyeOffset, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-7 + eyeOffset, -2, 1.3, 0, Math.PI * 2);
      ctx.arc(5 + eyeOffset, -2, 1.3, 0, Math.PI * 2);
      ctx.arc(-5 + eyeOffset, 1.5, 0.8, 0, Math.PI * 2);
      ctx.arc(7 + eyeOffset, 1.5, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lips / Mouth
    ctx.fillStyle = '#d81b60';
    ctx.beginPath();
    if (animation === 'laugh') {
      ctx.arc(eyeOffset, 7, 4, 0, Math.PI);
      ctx.fill();
    } else if (animation === 'cry') {
      ctx.arc(eyeOffset, 8, 3.5, Math.PI, 0);
      ctx.stroke();
    } else {
      ctx.arc(eyeOffset, 6, 2.5, 0, Math.PI);
      ctx.fill();
    }

    ctx.restore();
  }

  private static drawFrontHair(
    ctx: CanvasRenderingContext2D,
    hair: { style: string; primaryColor: string; secondaryColor: string },
    headBob: number,
    isBackFacing: boolean
  ) {
    ctx.save();
    ctx.translate(0, -62 + headBob);
    ctx.fillStyle = hair.primaryColor;

    if (isBackFacing) {
      ctx.beginPath();
      ctx.ellipse(0, -3, 15, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    switch (hair.style) {
      case 'scene_swoop':
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.bezierCurveTo(-16, -18, 14, -20, 15, -4);
        ctx.bezierCurveTo(13, 12, -2, 9, -15, 0);
        ctx.closePath();
        ctx.fill();
        // Highlight streak
        ctx.fillStyle = hair.secondaryColor;
        ctx.beginPath();
        ctx.moveTo(-9, -11);
        ctx.bezierCurveTo(4, -13, 11, -5, 7, 5);
        ctx.lineTo(3, 5);
        ctx.bezierCurveTo(7, -2, 1, -9, -9, -11);
        ctx.closePath();
        ctx.fill();
        break;

      case 'spiky_rebel':
        ctx.beginPath();
        ctx.moveTo(-15, -4);
        ctx.lineTo(-11, -20);
        ctx.lineTo(-4, -13);
        ctx.lineTo(0, -22);
        ctx.lineTo(6, -14);
        ctx.lineTo(12, -19);
        ctx.lineTo(15, -2);
        ctx.bezierCurveTo(15, 6, -15, 6, -15, -4);
        ctx.closePath();
        ctx.fill();
        break;

      case 'high_ponytail':
        ctx.beginPath();
        ctx.arc(0, -6, 14, Math.PI, 0);
        ctx.fill();
        // Ponytail
        ctx.beginPath();
        ctx.ellipse(14, -16, 7, 12, 0.45, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'afro_puffs':
        ctx.beginPath();
        ctx.arc(-14, -16, 9, 0, Math.PI * 2);
        ctx.arc(14, -16, 9, 0, Math.PI * 2);
        ctx.arc(0, -6, 13, Math.PI, 0);
        ctx.fill();
        break;

      default:
        ctx.beginPath();
        ctx.arc(0, -5, 14.5, Math.PI, 0);
        ctx.bezierCurveTo(15, 3, -15, 3, -14.5, -5);
        ctx.closePath();
        ctx.fill();
        break;
    }

    ctx.restore();
  }

  private static drawHeadAccessory(
    ctx: CanvasRenderingContext2D,
    acc: { style: string; primaryColor: string; secondaryColor: string },
    headBob: number,
    isBackFacing: boolean
  ) {
    ctx.save();
    ctx.translate(0, -75 + headBob);

    if (acc.style === 'kitty_headphones') {
      ctx.strokeStyle = acc.primaryColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 9, 15, Math.PI, 0);
      ctx.stroke();

      // Ears
      ctx.fillStyle = acc.primaryColor;
      ctx.beginPath();
      ctx.moveTo(-11, 1);
      ctx.lineTo(-8, -8);
      ctx.lineTo(-5, 1);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(5, 1);
      ctx.lineTo(8, -8);
      ctx.lineTo(11, 1);
      ctx.closePath();
      ctx.fill();

      // Glow inner
      ctx.fillStyle = acc.secondaryColor;
      ctx.beginPath();
      ctx.moveTo(-9, 1);
      ctx.lineTo(-8, -5);
      ctx.lineTo(-7, 1);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(7, 1);
      ctx.lineTo(8, -5);
      ctx.lineTo(9, 1);
      ctx.closePath();
      ctx.fill();
    } else if (acc.style === 'gold_crown') {
      ctx.fillStyle = acc.primaryColor;
      ctx.beginPath();
      ctx.moveTo(-11, 7);
      ctx.lineTo(-11, -2);
      ctx.lineTo(-5, 3);
      ctx.lineTo(0, -5);
      ctx.lineTo(5, 3);
      ctx.lineTo(11, -2);
      ctx.lineTo(11, 7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = acc.secondaryColor;
      ctx.beginPath();
      ctx.arc(0, 1, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private static drawTears(ctx: CanvasRenderingContext2D, headBob: number, frame: number) {
    const tearY = (frame * 1.6) % 20;
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.arc(-7, -56 + headBob + tearY, 2.5, 0, Math.PI * 2);
    ctx.arc(7, -56 + headBob + tearY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawMusicalNotes(ctx: CanvasRenderingContext2D, bodyBob: number, frame: number) {
    const noteFloat = (frame * 1.3) % 32;
    ctx.fillStyle = '#ff4081';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('♫', 18, -66 + bodyBob - noteFloat);
  }
}
